# AppRichTextEditor

A comprehensive rich text editor component built on TipTap with customizable toolbar controls. Supports essential text formatting operations with full accessibility and validation features.

## Features

- **Rich Text Editing**: Bold, italic, underline, strikethrough, headings, lists, and links
- **Customizable Toolbar**: Full or inline control modes
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Form Integration**: Validation support with error messages
- **Copy Functionality**: Optional copy button for content
- **Internationalization**: Configurable labels for all toolbar buttons
- **Responsive Design**: Mobile-first approach with touch-friendly controls

## Usage

```vue
<template>
  <AppRichTextEditor
    v-model="content"
    label="Article Content"
    :labels="editorLabels"
    required
    info-message="Write your article content here"
    @update:model-value="handleContentChange"
  />
</template>

<script setup>
import { ref } from 'vue';

const content = ref('<p>Initial content</p>');

const editorLabels = {
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strikethrough: 'Strikethrough',
  heading: 'Heading',
  bulletList: 'Bullet List',
  numberedList: 'Numbered List',
  link: 'Link',
};

function handleContentChange(value) {
  console.log('Content updated:', value);
}
</script>
```

## Related Components

### AppRichTextEditorButton

Toolbar button component used internally by AppRichTextEditor. Provides active/inactive states and accessibility features. See component props and documentation in the TypeScript interface.

## Validation

The component integrates with Vuelidate for form validation:

- Supports required field validation
- Displays error messages below the editor
- Provides visual feedback for validation states
- Customizable error messages through props
