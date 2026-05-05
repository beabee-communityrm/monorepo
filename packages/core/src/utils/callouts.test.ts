import type {
  CalloutComponentInputSelectSchema,
  CalloutComponentInputSelectableRadioSchema,
  CalloutComponentInputSelectableSchema,
  CalloutComponentInputTextFieldSchema,
} from '@beabee/beabee-common';
import { CalloutComponentType } from '@beabee/beabee-common';

import { describe, expect, test, vi } from 'vitest';

import {
  getSelectableValueFromLabel,
  parseSelectableMultiValue,
} from './callouts';

const textComponent: CalloutComponentInputTextFieldSchema = {
  id: 'myTextComponent',
  type: CalloutComponentType.INPUT_TEXT_FIELD,
  key: 'myTextComponent',
  label: 'My text component',
  input: true,
};

const selectComponent: CalloutComponentInputSelectSchema = {
  id: 'mySelectComponent',
  type: CalloutComponentType.INPUT_SELECT,
  key: 'mySelectComponent',
  label: 'My select component',
  input: true,
  data: {
    values: [
      { value: 'opt1', label: 'Option 1' },
      { value: 'opt2', label: 'Option 2' },
      { value: 'opt3', label: 'Option 3' },
    ],
  },
};

describe('getSelectableValueFromLabel', () => {
  const ageRadio: CalloutComponentInputSelectableRadioSchema = {
    id: 'age',
    type: CalloutComponentType.INPUT_SELECTABLE_RADIO,
    key: 'age',
    label: 'Age',
    input: true,
    values: [
      // Trailing space in label — simulates real beabee form schema data.
      { value: '3544Jahre', label: '35 - 44 Jahre ', nextSlideId: '' },
      { value: '4554Jahre', label: '45 - 54 Jahre', nextSlideId: '' },
    ],
  };

  test('exact label match returns the internal value', () => {
    expect(getSelectableValueFromLabel(ageRadio, '45 - 54 Jahre')).toBe(
      '4554Jahre'
    );
  });

  test('matches despite trailing whitespace in the schema label', () => {
    expect(getSelectableValueFromLabel(ageRadio, '35 - 44 Jahre')).toBe(
      '3544Jahre'
    );
  });

  test('matches despite trailing whitespace in the input', () => {
    expect(getSelectableValueFromLabel(ageRadio, '45 - 54 Jahre  ')).toBe(
      '4554Jahre'
    );
  });

  test('collapses internal whitespace when comparing', () => {
    expect(getSelectableValueFromLabel(ageRadio, '45  -  54 Jahre')).toBe(
      '4554Jahre'
    );
  });

  test('unknown label falls back to trimmed input', () => {
    expect(getSelectableValueFromLabel(ageRadio, '  Unknown  ')).toBe(
      'Unknown'
    );
  });

  test('INPUT_SELECT uses data.values', () => {
    expect(getSelectableValueFromLabel(selectComponent, 'Option 2')).toBe(
      'opt2'
    );
  });

  test('non-selectable component returns the trimmed input', () => {
    expect(getSelectableValueFromLabel(textComponent, '  hello  ')).toBe(
      'hello'
    );
  });
});

describe('parseSelectableMultiValue', () => {
  const kanaele: CalloutComponentInputSelectableSchema = {
    id: 'kanaele',
    type: CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES,
    key: 'kanaele',
    label: 'Kanäle',
    input: true,
    values: [
      { value: 'fernsehen', label: 'Fernsehen', nextSlideId: '' },
      {
        value: 'sozialeMedien',
        // Label with three internal commas — this is the exact class of label
        // that breaks the naive split(',') approach in the old import script.
        label: 'Soziale Medien (Facebook, YouTube, Instagram, X/Twitter usw.)',
        nextSlideId: '',
      },
      { value: 'nachrichtenApps', label: 'Nachrichten-Apps', nextSlideId: '' },
    ],
  };

  const jaNein: CalloutComponentInputSelectableSchema = {
    id: 'jaNein',
    type: CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES,
    key: 'jaNein',
    label: 'Ja/Nein',
    input: true,
    values: [
      // "Ja, mehrmals" contains a comma AND has "Ja" as a proper prefix
      // shared with "Ja, gelegentlich". Longest-first ordering is what makes
      // this work — the test below pins that ordering.
      { value: 'jaMehrmals', label: 'Ja, mehrmals', nextSlideId: '' },
      { value: 'jaGelegentlich', label: 'Ja, gelegentlich', nextSlideId: '' },
      { value: 'nein', label: 'Nein', nextSlideId: '' },
    ],
  };

  test('returns empty object for empty input', () => {
    expect(parseSelectableMultiValue(kanaele, '')).toEqual({});
    expect(parseSelectableMultiValue(kanaele, '   ')).toEqual({});
  });

  test('single value match', () => {
    expect(parseSelectableMultiValue(kanaele, 'Fernsehen')).toEqual({
      fernsehen: true,
    });
  });

  test('multiple values without comma-in-label', () => {
    expect(
      parseSelectableMultiValue(kanaele, 'Fernsehen, Nachrichten-Apps')
    ).toEqual({ fernsehen: true, nachrichtenApps: true });
  });

  test('label containing commas matched alongside plain label', () => {
    expect(
      parseSelectableMultiValue(
        kanaele,
        'Fernsehen, Soziale Medien (Facebook, YouTube, Instagram, X/Twitter usw.), Nachrichten-Apps'
      )
    ).toEqual({
      fernsehen: true,
      sozialeMedien: true,
      nachrichtenApps: true,
    });
  });

  test('two comma-containing labels side by side', () => {
    expect(
      parseSelectableMultiValue(jaNein, 'Ja, mehrmals, Ja, gelegentlich')
    ).toEqual({ jaMehrmals: true, jaGelegentlich: true });
  });

  test('unknown fragment reported once and kept as raw key', () => {
    const onWarn = vi.fn();
    const result = parseSelectableMultiValue(
      kanaele,
      'Fernsehen, Zeitung, Nachrichten-Apps',
      onWarn
    );
    expect(result).toEqual({
      fernsehen: true,
      Zeitung: true,
      nachrichtenApps: true,
    });
    expect(onWarn).toHaveBeenCalledTimes(1);
    expect(onWarn).toHaveBeenCalledWith('Zeitung');
  });

  test('tolerates double spaces and leading/trailing separators', () => {
    expect(
      parseSelectableMultiValue(kanaele, ', Fernsehen,  Nachrichten-Apps ,')
    ).toEqual({ fernsehen: true, nachrichtenApps: true });
  });

  test('trailing whitespace in schema label still matches', () => {
    const withTrailing: CalloutComponentInputSelectableSchema = {
      ...kanaele,
      values: [
        { value: 'fernsehen', label: 'Fernsehen ', nextSlideId: '' },
        { value: 'radio', label: 'Radio', nextSlideId: '' },
      ],
    };
    expect(parseSelectableMultiValue(withTrailing, 'Fernsehen, Radio')).toEqual(
      { fernsehen: true, radio: true }
    );
  });
});
