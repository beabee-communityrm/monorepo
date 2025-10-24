import type {
  CalloutComponentContentSchema,
  CalloutComponentInputFileSchema,
  CalloutComponentInputSelectSchema,
  CalloutComponentInputSelectableRadioSchema,
  CalloutComponentInputSelectableSchema,
  CalloutComponentInputSignatureSchema,
  CalloutComponentInputTextAreaSchema,
  CalloutComponentInputTextFieldSchema,
  CalloutComponentInputUrlSchema,
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

const signatureComponent: CalloutComponentInputSignatureSchema = {
  id: 'signature1',
  type: CalloutComponentType.INPUT_SIGNATURE,
  key: 'signature1',
  label: 'Signature',
  input: true,
  adminOnly: false,
};

const fileComponent: CalloutComponentInputFileSchema = {
  id: 'file1',
  type: CalloutComponentType.INPUT_FILE,
  key: 'file1',
  label: 'Upload Document',
  input: true,
  adminOnly: false,
  storage: 'url',
};

const fileArrayComponent: CalloutComponentInputFileSchema = {
  id: 'fileArray',
  type: CalloutComponentType.INPUT_FILE,
  key: 'fileArray',
  label: 'Upload Multiple Documents',
  input: true,
  adminOnly: false,
  storage: 'url',
  multiple: true,
};

const formioFileArrayComponent: CalloutComponentInputFileSchema = {
  id: 'formioFileArray',
  type: CalloutComponentType.INPUT_FILE,
  key: 'formioFileArray',
  label: 'Upload Formio Files',
  input: true,
  adminOnly: false,
  storage: 'beabee',
  multiple: true,
};

const urlComponent: CalloutComponentInputUrlSchema = {
  id: 'url1',
  type: CalloutComponentType.INPUT_URL,
  key: 'url1',
  label: 'Website URL',
  input: true,
  adminOnly: false,
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
        signatureComponent,
        fileComponent,
        fileArrayComponent,
        formioFileArrayComponent,
        urlComponent,
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
    signature1:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    file1: {
      url: 'http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif',
      path: '/uploads/image.avif',
    },
    url1: 'http://localhost:3002/api/1.0/documents/12345-67890.pdf',
    // content1 is missing - should be ignored
  },
  slide2: {
    textField1: 'Second slide answer',
  },
};

// Test data for file upload arrays
const answersWithFileArray: CalloutResponseAnswersSlide = {
  slide1: {
    fileArray: [
      {
        url: 'http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif',
        path: '/uploads/image1.avif',
      },
      {
        url: 'http://localhost:3002/api/1.0/documents/12345-67890.pdf',
        path: '/uploads/document.pdf',
      },
    ],
  },
};

// Test data for formio file arrays
const answersWithFormioFileArray: CalloutResponseAnswersSlide = {
  slide1: {
    formioFileArray: [
      {
        url: 'http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif',
        path: 'images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif',
      },
      {
        url: 'http://localhost:3002/api/1.0/documents/12345-67890.pdf',
        path: 'documents/12345-67890.pdf',
      },
    ],
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
    expect(result).toContain(
      '<strong>Website URL:</strong> <a href="http://localhost:3002/api/1.0/documents/12345-67890.pdf" target="_blank" rel="noopener noreferrer">http://localhost:3002/api/1.0/documents/12345-67890.pdf</a>'
    );
    expect(result).toContain(
      '<strong>Upload Document:</strong> <a href="http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif" target="_blank" rel="noopener noreferrer">http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif</a>'
    );

    // Should not contain admin-only field or content component
    expect(result).not.toContain('Admin Only Field');
    expect(result).not.toContain('Content Component');
  });

  it('renders signature components as img elements', () => {
    const result = formatCalloutResponseAnswersToHtml(answers, formSchema);

    expect(result).toContain(
      '<strong>Signature:</strong> <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="Signature" style="max-width: 300px; height: auto; border: 1px solid #ccc;" />'
    );
  });

  it('handles non-signature components with data:image strings normally', () => {
    const textComponentWithImageData: CalloutComponentInputTextFieldSchema = {
      id: 'textFieldWithImage',
      type: CalloutComponentType.INPUT_TEXT_FIELD,
      key: 'textFieldWithImage',
      label: 'Text Field with Image Data',
      input: true,
    };

    const schemaWithImageText: SetCalloutFormSchema = {
      slides: [
        {
          ...formSchema.slides[0],
          components: [textComponentWithImageData],
        } as SetCalloutSlideSchema,
      ],
    };

    const answersWithImageText: CalloutResponseAnswersSlide = {
      slide1: {
        textFieldWithImage:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      },
    };

    const result = formatCalloutResponseAnswersToHtml(
      answersWithImageText,
      schemaWithImageText
    );

    // Should render as plain text, not as an image element
    expect(result).toContain(
      '<strong>Text Field with Image Data:</strong> data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    );
    expect(result).not.toContain('<img src=');
  });

  it('renders URL components as external links', () => {
    const result = formatCalloutResponseAnswersToHtml(answers, formSchema);

    expect(result).toContain(
      '<strong>Website URL:</strong> <a href="http://localhost:3002/api/1.0/documents/12345-67890.pdf" target="_blank" rel="noopener noreferrer">http://localhost:3002/api/1.0/documents/12345-67890.pdf</a>'
    );
  });

  it('renders file upload components as external links', () => {
    const result = formatCalloutResponseAnswersToHtml(answers, formSchema);

    expect(result).toContain(
      '<strong>Upload Document:</strong> <a href="http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif" target="_blank" rel="noopener noreferrer">http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif</a>'
    );
  });

  it('renders file upload arrays as multiple external links', () => {
    const schemaWithFileArray: SetCalloutFormSchema = {
      slides: [
        {
          ...formSchema.slides[0],
          components: [fileArrayComponent],
        } as SetCalloutSlideSchema,
      ],
    };

    const result = formatCalloutResponseAnswersToHtml(
      answersWithFileArray,
      schemaWithFileArray
    );

    expect(result).toContain(
      '<strong>Upload Multiple Documents:</strong> <a href="http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif" target="_blank" rel="noopener noreferrer">http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif</a><br /><a href="http://localhost:3002/api/1.0/documents/12345-67890.pdf" target="_blank" rel="noopener noreferrer">http://localhost:3002/api/1.0/documents/12345-67890.pdf</a>'
    );
  });

  it('renders formio file upload arrays as multiple external links', () => {
    const schemaWithFormioFileArray: SetCalloutFormSchema = {
      slides: [
        {
          ...formSchema.slides[0],
          components: [formioFileArrayComponent],
        } as SetCalloutSlideSchema,
      ],
    };

    const result = formatCalloutResponseAnswersToHtml(
      answersWithFormioFileArray,
      schemaWithFormioFileArray
    );

    expect(result).toContain(
      '<strong>Upload Formio Files:</strong> <a href="http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif" target="_blank" rel="noopener noreferrer">http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif</a><br /><a href="http://localhost:3002/api/1.0/documents/12345-67890.pdf" target="_blank" rel="noopener noreferrer">http://localhost:3002/api/1.0/documents/12345-67890.pdf</a>'
    );
  });

  it('renders localhost URLs as external links', () => {
    const urlComponentLocalhost: CalloutComponentInputUrlSchema = {
      id: 'urlLocalhost',
      type: CalloutComponentType.INPUT_URL,
      key: 'urlLocalhost',
      label: 'Localhost URL',
      input: true,
    };

    const schemaWithLocalhost: SetCalloutFormSchema = {
      slides: [
        {
          ...formSchema.slides[0],
          components: [urlComponentLocalhost],
        } as SetCalloutSlideSchema,
      ],
    };

    const answersWithLocalhost: CalloutResponseAnswersSlide = {
      slide1: {
        urlLocalhost:
          'http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif',
      },
    };

    const result = formatCalloutResponseAnswersToHtml(
      answersWithLocalhost,
      schemaWithLocalhost
    );

    expect(result).toContain(
      '<strong>Localhost URL:</strong> <a href="http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif" target="_blank" rel="noopener noreferrer">http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif</a>'
    );
  });

  it('handles non-URL components with URL-like strings normally', () => {
    const textComponentWithUrl: CalloutComponentInputTextFieldSchema = {
      id: 'textFieldWithUrl',
      type: CalloutComponentType.INPUT_TEXT_FIELD,
      key: 'textFieldWithUrl',
      label: 'Text Field with URL',
      input: true,
    };

    const schemaWithUrlText: SetCalloutFormSchema = {
      slides: [
        {
          ...formSchema.slides[0],
          components: [textComponentWithUrl],
        } as SetCalloutSlideSchema,
      ],
    };

    const answersWithUrlText: CalloutResponseAnswersSlide = {
      slide1: {
        textFieldWithUrl:
          'http://localhost:3002/api/1.0/documents/12345-67890.pdf',
      },
    };

    const result = formatCalloutResponseAnswersToHtml(
      answersWithUrlText,
      schemaWithUrlText
    );

    // Should render as plain text, not as a link
    expect(result).toContain(
      '<strong>Text Field with URL:</strong> http://localhost:3002/api/1.0/documents/12345-67890.pdf'
    );
    expect(result).not.toContain('<a href=');
  });

  it('handles URL components with invalid URLs as plain text', () => {
    const urlComponentWithInvalidUrl: CalloutComponentInputUrlSchema = {
      id: 'urlInvalid',
      type: CalloutComponentType.INPUT_URL,
      key: 'urlInvalid',
      label: 'Invalid URL',
      input: true,
    };

    const schemaWithInvalidUrl: SetCalloutFormSchema = {
      slides: [
        {
          ...formSchema.slides[0],
          components: [urlComponentWithInvalidUrl],
        } as SetCalloutSlideSchema,
      ],
    };

    const answersWithInvalidUrl: CalloutResponseAnswersSlide = {
      slide1: {
        urlInvalid: '/relative/path/without/protocol',
      },
    };

    const result = formatCalloutResponseAnswersToHtml(
      answersWithInvalidUrl,
      schemaWithInvalidUrl
    );

    // Should render as plain text, not as a link
    expect(result).toContain(
      '<strong>Invalid URL:</strong> /relative/path/without/protocol'
    );
    expect(result).not.toContain('<a href=');
  });

  it('handles file components with invalid URLs as plain text', () => {
    const fileComponentWithInvalidUrl: CalloutComponentInputFileSchema = {
      id: 'fileInvalid',
      type: CalloutComponentType.INPUT_FILE,
      key: 'fileInvalid',
      label: 'Invalid File URL',
      input: true,
      storage: 'url',
    };

    const schemaWithInvalidFile: SetCalloutFormSchema = {
      slides: [
        {
          ...formSchema.slides[0],
          components: [fileComponentWithInvalidUrl],
        } as SetCalloutSlideSchema,
      ],
    };

    const answersWithInvalidFile: CalloutResponseAnswersSlide = {
      slide1: {
        fileInvalid: {
          url: '/invalid/relative/path',
          path: '/invalid/path',
        },
      },
    };

    const result = formatCalloutResponseAnswersToHtml(
      answersWithInvalidFile,
      schemaWithInvalidFile
    );

    // Should render as plain text, not as a link
    expect(result).toContain(
      '<strong>Invalid File URL:</strong> /invalid/relative/path'
    );
    expect(result).not.toContain('<a href=');
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
