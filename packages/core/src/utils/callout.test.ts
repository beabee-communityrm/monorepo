import type {
  CalloutComponentContentSchema,
  CalloutComponentInputSelectSchema,
  CalloutComponentInputSelectableRadioSchema,
  CalloutComponentInputSelectableSchema,
  CalloutComponentInputTextAreaSchema,
  CalloutComponentInputTextFieldSchema,
  CalloutResponseAnswersSlide,
  SetCalloutFormSchema,
  SetCalloutNavigationSchema,
  SetCalloutSlideSchema,
} from '@beabee/beabee-common';
import { CalloutComponentType } from '@beabee/beabee-common';

import { describe, expect, it } from 'vitest';

import { formatCalloutResponseAnswersToHtml } from './callout';

const textComponent: CalloutComponentInputTextFieldSchema = {
  id: 'textField1',
  type: CalloutComponentType.INPUT_TEXT_FIELD,
  key: 'textField1',
  label: 'Text Field',
  input: true,
};

const textAreaComponent: CalloutComponentInputTextAreaSchema = {
  id: 'textArea1',
  type: CalloutComponentType.INPUT_TEXT_AREA,
  key: 'textArea1',
  label: 'Text Area',
  input: true,
};

const radioComponent: CalloutComponentInputSelectableRadioSchema = {
  id: 'radio1',
  type: CalloutComponentType.INPUT_SELECTABLE_RADIO,
  key: 'radio1',
  label: 'Radio Component',
  input: true,
  values: [
    { value: 'opt1', label: 'Option 1', nextSlideId: '' },
    { value: 'opt2', label: 'Option 2', nextSlideId: '' },
    { value: 'opt3', label: 'Option 3', nextSlideId: '' },
  ],
};

const selectComponent: CalloutComponentInputSelectSchema = {
  id: 'select1',
  type: CalloutComponentType.INPUT_SELECT,
  key: 'select1',
  label: 'Select Component',
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
  id: 'selectBox1',
  type: CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES,
  key: 'selectBox1',
  label: 'Select Box Component',
  input: true,
  values: [
    { value: 'opt1', label: 'Option 1', nextSlideId: '' },
    { value: 'opt2', label: 'Option 2', nextSlideId: '' },
    { value: 'opt3', label: 'Option 3', nextSlideId: '' },
  ],
};

const adminOnlyComponent: CalloutComponentInputTextFieldSchema = {
  id: 'adminField1',
  type: CalloutComponentType.INPUT_TEXT_FIELD,
  key: 'adminField1',
  label: 'Admin Only Field',
  input: true,
  adminOnly: true,
};

const contentComponent: CalloutComponentContentSchema = {
  id: 'content1',
  type: CalloutComponentType.CONTENT,
  key: 'content1',
  label: 'Content Component',
  input: false,
  html: '<p>Some content</p>',
};

const formSchema: SetCalloutFormSchema = {
  slides: [
    {
      id: 'slide1',
      title: 'Slide 1',
      components: [
        textComponent,
        textAreaComponent,
        radioComponent,
        selectComponent,
        selectBoxComponent,
        adminOnlyComponent,
        contentComponent,
      ],
      navigation: {
        nextSlideId: '',
      } as SetCalloutNavigationSchema,
    } as SetCalloutSlideSchema,
    {
      id: 'slide2',
      title: 'Slide 2',
      components: [textComponent],
      navigation: {
        nextSlideId: '',
      } as SetCalloutNavigationSchema,
    } as SetCalloutSlideSchema,
  ],
};

const answers: CalloutResponseAnswersSlide = {
  slide1: {
    textField1: 'Sample text answer',
    textArea1: 'Sample textarea answer',
    radio1: 'opt2',
    select1: 'opt3',
    selectBox1: {
      opt1: true,
      opt2: false,
      opt3: true,
    },
    adminField1: 'This should be filtered out',
    // content1 is missing - should be ignored
  },
  slide2: {
    textField1: 'Second slide answer',
  },
};

const answersWithEmpty: CalloutResponseAnswersSlide = {
  slide1: {
    textField1: '',
    textArea1: undefined,
    radio1: undefined,
    select1: 'opt1',
    selectBox1: {},
  },
};

const componentText: Record<string, string> = {
  'Text Field': 'Translated Text Field',
  'Radio Component': 'Translated Radio Component',
};

describe('formatCalloutResponseAnswersToHtml', () => {
  it('formats all non-empty answers correctly', () => {
    const result = formatCalloutResponseAnswersToHtml(answers, formSchema);

    expect(result).toContain('<strong>Text Field:</strong> Sample text answer');
    expect(result).toContain(
      '<strong>Text Area:</strong> Sample textarea answer'
    );
    expect(result).toContain('<strong>Radio Component:</strong> Option 2');
    expect(result).toContain('<strong>Select Component:</strong> Option 3');
    expect(result).toContain(
      '<strong>Select Box Component:</strong> Option 1, Option 3'
    );
    expect(result).toContain(
      '<strong>Text Field:</strong> Second slide answer'
    );

    // Should not contain admin-only field or content component
    expect(result).not.toContain('Admin Only Field');
    expect(result).not.toContain('Content Component');
  });

  it('skips empty and undefined answers', () => {
    const result = formatCalloutResponseAnswersToHtml(
      answersWithEmpty,
      formSchema
    );

    // Should only contain the non-empty answer
    expect(result).toContain('<strong>Select Component:</strong> Option 1');
    expect(result).not.toContain('Text Field');
    expect(result).not.toContain('Text Area');
    expect(result).not.toContain('Radio Component');
    expect(result).not.toContain('Select Box Component');
  });

  it('uses component translations when available', () => {
    const result = formatCalloutResponseAnswersToHtml(
      answers,
      formSchema,
      componentText
    );

    // Should use translated labels
    expect(result).toContain(
      '<strong>Translated Text Field:</strong> Sample text answer'
    );
    expect(result).toContain(
      '<strong>Translated Text Field:</strong> Second slide answer'
    );

    // Should still use original labels for untranslated components
    expect(result).toContain(
      '<strong>Text Area:</strong> Sample textarea answer'
    );
  });

  it('filters out admin-only components', () => {
    const result = formatCalloutResponseAnswersToHtml(answers, formSchema);

    expect(result).not.toContain('Admin Only Field');
    expect(result).not.toContain('This should be filtered out');
  });

  it('filters out non-input components', () => {
    const result = formatCalloutResponseAnswersToHtml(answers, formSchema);

    expect(result).not.toContain('Content Component');
  });

  it('handles missing slide answers gracefully', () => {
    const incompleteAnswers: CalloutResponseAnswersSlide = {
      slide1: {
        textField1: 'Only answer',
      },
      // slide2 is missing
    };

    const result = formatCalloutResponseAnswersToHtml(
      incompleteAnswers,
      formSchema
    );

    expect(result).toContain('<strong>Text Field:</strong> Only answer');
    expect(result).not.toContain('Second slide answer');
  });

  it('returns empty string for completely empty answers', () => {
    const emptyAnswers: CalloutResponseAnswersSlide = {};

    const result = formatCalloutResponseAnswersToHtml(emptyAnswers, formSchema);

    expect(result).toBe('');
  });

  it('returns empty string for form schema with no slides', () => {
    const emptySchema: SetCalloutFormSchema = { slides: [] };

    const result = formatCalloutResponseAnswersToHtml(answers, emptySchema);

    expect(result).toBe('');
  });

  it('uses component key as fallback label when no label is provided', () => {
    const componentWithoutLabel: CalloutComponentInputTextFieldSchema = {
      ...textComponent,
      label: '',
    };

    const schemaWithKeyLabel: SetCalloutFormSchema = {
      slides: [
        {
          ...formSchema.slides[0],
          components: [componentWithoutLabel],
        } as SetCalloutSlideSchema,
      ],
    };

    const testAnswers: CalloutResponseAnswersSlide = {
      slide1: {
        textField1: 'Test answer',
      },
    };

    const result = formatCalloutResponseAnswersToHtml(
      testAnswers,
      schemaWithKeyLabel
    );

    expect(result).toContain('<strong>textField1:</strong> Test answer');
  });

  it('handles answers with no corresponding components', () => {
    const extraAnswers: CalloutResponseAnswersSlide = {
      slide1: {
        textField1: 'Valid answer',
        nonexistentField: 'This should be ignored',
      },
    };

    const result = formatCalloutResponseAnswersToHtml(extraAnswers, formSchema);

    expect(result).toContain('<strong>Text Field:</strong> Valid answer');
    expect(result).not.toContain('nonexistentField');
  });

  it('generates correct HTML structure with multiple paragraphs', () => {
    const result = formatCalloutResponseAnswersToHtml(answers, formSchema);

    // Should contain multiple <p> tags
    const paragraphCount = (result.match(/<p>/g) || []).length;
    expect(paragraphCount).toBeGreaterThan(1);

    // Should be properly closed
    expect(result).toMatch(/<\/p>$/);
  });
});
