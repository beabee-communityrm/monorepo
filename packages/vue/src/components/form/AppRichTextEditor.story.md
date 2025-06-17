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

## Props

| Prop                   | Type                   | Default                     | Description                            |
| ---------------------- | ---------------------- | --------------------------- | -------------------------------------- |
| `modelValue`           | `string`               | -                           | Current HTML content of the editor     |
| `label`                | `string`               | `undefined`                 | Label for the editor field             |
| `infoMessage`          | `string`               | `undefined`                 | Helper text displayed below the editor |
| `required`             | `boolean`              | `false`                     | Whether the field is required          |
| `disabled`             | `boolean`              | `false`                     | Whether the editor is disabled         |
| `copyable`             | `boolean`              | `false`                     | Whether to show copy button            |
| `placeholder`          | `string`               | `undefined`                 | Placeholder text when editor is empty  |
| `controls`             | `'full' \| 'inline'`   | `'full'`                    | Controls displayed in toolbar          |
| `labels`               | `RichTextEditorLabels` | -                           | Labels for toolbar buttons             |
| `requiredErrorMessage` | `string`               | `'This field is required'`  | Error message for required validation  |
| `toolbarAriaLabel`     | `string`               | `'Text formatting toolbar'` | ARIA label for toolbar                 |
| `editorAriaLabel`      | `string`               | `'Rich text editor'`        | ARIA label for editor content          |

## Events

| Event               | Payload  | Description                         |
| ------------------- | -------- | ----------------------------------- |
| `update:modelValue` | `string` | Emitted when editor content changes |

## Types

### RichTextEditorLabels

```typescript
interface RichTextEditorLabels {
  bold: string;
  italic: string;
  underline: string;
  strikethrough: string;
  heading: string;
  bulletList: string;
  numberedList: string;
  link: string;
}
```

## Accessibility

- **Semantic HTML**: Uses proper heading structure and form elements
- **ARIA Labels**: Comprehensive labeling for screen readers
- **Keyboard Navigation**: Full keyboard support for all formatting commands
- **Focus Management**: Proper focus handling within the editor
- **Touch-Friendly**: Minimum 44x44px touch targets for mobile users

## Validation

The component integrates with Vuelidate for form validation:

- Supports required field validation
- Displays error messages below the editor
- Provides visual feedback for validation states
- Customizable error messages through props
