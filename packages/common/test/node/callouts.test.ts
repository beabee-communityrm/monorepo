import {
  CalloutComponentBaseNestableSchema,
  CalloutComponentInputSelectSchema,
  CalloutComponentInputSelectableRadioSchema,
  CalloutComponentInputSelectableSchema,
  CalloutComponentInputTextFieldSchema,
  CalloutComponentType,
  CalloutResponseAnswersSlide,
  GetCalloutFormSchema,
  getCalloutComponents,
  isFileUploadAnswer,
  isFormioFileAnswer,
  stringifyAnswer,
} from '@beabee/beabee-common';

import { describe, expect, test } from 'vitest';

const textComponent: CalloutComponentInputTextFieldSchema = {
  id: 'myTextComponent',
  type: CalloutComponentType.INPUT_TEXT_FIELD,
  key: 'myTextComponent',
  label: 'My text component',
  input: true,
};

const textComponent2: CalloutComponentInputTextFieldSchema = {
  id: 'myTextComponent2',
  type: CalloutComponentType.INPUT_TEXT_FIELD,
  key: 'myTextComponent2',
  label: 'My text component',
  input: true,
};

const radioComponent: CalloutComponentInputSelectableRadioSchema = {
  id: 'myRadioComponent',
  type: CalloutComponentType.INPUT_SELECTABLE_RADIO,
  key: 'myRadioComponent',
  label: 'My radio component',
  input: true,
  values: [
    { value: 'opt1', label: 'Option 1', nextSlideId: '' },
    { value: 'opt2', label: 'Option 2', nextSlideId: '' },
    { value: 'opt3', label: 'Option 3', nextSlideId: '' },
  ],
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

const selectBoxComponent: CalloutComponentInputSelectableSchema = {
  id: 'mySelectBoxComponent',
  type: CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES,
  key: 'mySelectBoxComponent',
  label: 'My select box component',
  input: true,
  values: [
    { value: 'opt1', label: 'Option 1', nextSlideId: '' },
    { value: 'opt2', label: 'Option 2', nextSlideId: '' },
    { value: 'opt3', label: 'Option 3', nextSlideId: '' },
  ],
};

// TODO: Add tests for nested components
const panelComponent: CalloutComponentBaseNestableSchema = {
  id: 'myPanelComponent',
  type: CalloutComponentType.NESTABLE_PANEL,
  key: 'myPanelComponent',
  label: 'My panel component',
  input: false,
  components: [textComponent, textComponent2],
};

const answers: CalloutResponseAnswersSlide = {
  slide1: {
    myTextComponent: 'Some text',
    myTextComponent2: 'Some other text',
    myRadioComponent: 'opt1',
    mySelectComponent: 'opt2',
    mySelectBoxComponent: {
      opt1: true,
      opt2: false,
      opt3: true,
    },
  },
};

// Test data for file upload functions
const fileUploadAnswer = {
  url: 'http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif',
  path: '/uploads/image.avif',
};

const formioFileAnswer = {
  url: 'http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif',
  path: '/uploads/image.avif',
  storage: 'url',
  name: 'image.avif',
  size: 12345,
  originalName: 'uploaded-image.avif',
};

const formSchema: GetCalloutFormSchema = {
  slides: [
    {
      id: 'slide1',
      title: 'Slide 1',
      components: [
        textComponent,
        textComponent2,
        radioComponent,
        selectComponent,
        selectBoxComponent,
      ],
      navigation: {
        nextText: 'Next',
        prevText: 'Previous',
        submitText: 'Submit',
        nextSlideId: '',
      },
    },
  ],
  componentText: {},
};

describe('stringifyAnswers', () => {
  test('text components', () => {
    expect(
      stringifyAnswer(textComponent, answers.slide1?.myTextComponent)
    ).toBe('Some text');
  });

  test('radio components', () => {
    expect(
      stringifyAnswer(radioComponent, answers.slide1?.myRadioComponent)
    ).toBe('Option 1');
  });

  test('select box components', () => {
    expect(
      stringifyAnswer(selectBoxComponent, answers.slide1?.mySelectBoxComponent)
    ).toBe('Option 1, Option 3');
  });

  test('select components', () => {
    expect(
      stringifyAnswer(selectComponent, answers.slide1?.mySelectComponent)
    ).toBe('Option 2');
  });
});

describe('getCalloutFilters', () => {
  test('keep a flat form schema the same', () => {
    expect(getCalloutComponents(formSchema)).toEqual(
      formSchema.slides[0].components.map((c) => ({
        ...c,
        slideId: 'slide1',
        fullKey: `slide1.${c.key}`,
      }))
    );
  });
});

describe('isFileUploadAnswer', () => {
  test('valid file upload answer', () => {
    expect(isFileUploadAnswer(fileUploadAnswer)).toBe(true);
  });

  test('file upload answer with all required properties', () => {
    expect(isFileUploadAnswer(fileUploadAnswer)).toBe(true);
    if (isFileUploadAnswer(fileUploadAnswer)) {
      expect(fileUploadAnswer.url).toBe(
        'http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif'
      );
      expect(fileUploadAnswer.path).toBe('/uploads/image.avif');
    }
  });

  test('invalid file upload answer - null', () => {
    expect(isFileUploadAnswer(null)).toBe(false);
  });

  test('invalid file upload answer - undefined', () => {
    expect(isFileUploadAnswer(undefined)).toBe(false);
  });

  test('invalid file upload answer - string', () => {
    expect(isFileUploadAnswer('not an object')).toBe(false);
  });

  test('invalid file upload answer - number', () => {
    expect(isFileUploadAnswer(123)).toBe(false);
  });

  test('invalid file upload answer - object without url', () => {
    expect(isFileUploadAnswer({ path: '/some/path' })).toBe(false);
  });

  test('invalid file upload answer - object with url but wrong type', () => {
    expect(isFileUploadAnswer({ url: 123, path: '/some/path' })).toBe(false);
  });
});

describe('isFormioFileAnswer', () => {
  test('valid formio file upload answer', () => {
    expect(isFormioFileAnswer(formioFileAnswer)).toBe(true);
  });

  test('formio file answer with all required properties', () => {
    expect(isFormioFileAnswer(formioFileAnswer)).toBe(true);
    if (isFormioFileAnswer(formioFileAnswer)) {
      expect(formioFileAnswer.url).toBe(
        'http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif'
      );
      expect(formioFileAnswer.storage).toBe('url');
      expect(formioFileAnswer.name).toBe('image.avif');
      expect(formioFileAnswer.size).toBe(12345);
    }
  });

  test('invalid formio file answer - missing storage', () => {
    const incompleteFile = { ...formioFileAnswer };
    delete incompleteFile.storage;
    expect(isFormioFileAnswer(incompleteFile)).toBe(false);
  });

  test('invalid formio file answer - missing name', () => {
    const incompleteFile = { ...formioFileAnswer };
    delete incompleteFile.name;
    expect(isFormioFileAnswer(incompleteFile)).toBe(false);
  });

  test('invalid formio file answer - missing size', () => {
    const incompleteFile = { ...formioFileAnswer };
    delete incompleteFile.size;
    expect(isFormioFileAnswer(incompleteFile)).toBe(false);
  });

  test('basic file upload is not formio file upload', () => {
    expect(isFormioFileAnswer(fileUploadAnswer)).toBe(false);
  });
});
