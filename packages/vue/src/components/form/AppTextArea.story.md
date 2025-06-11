# AppTextArea

A comprehensive textarea component with built-in validation, character counting, and copy functionality. Designed for handling multi-line text input with configurable constraints and user-friendly feedback.

## Use Cases

### Social Media Descriptions

Used in admin settings for configuring social media sharing descriptions with character limits optimized for different platforms.

```vue
<AppTextArea
  v-model="shareContent.description"
  label="Social Sharing Description"
  :maxlength="160"
  required
  required-error-text="A description is required for social sharing"
  max-length-error-text="Description must be no more than 160 characters for optimal social sharing"
/>
```

### Callout Configuration

Used in callout builder for setting up descriptions, instructions, and introduction text.

```vue
<AppTextArea
  v-model="calloutData.description"
  label="Detailed Description"
  :maxlength="1000"
  required
  required-error-text="A description is required for the callout"
  character-count-text="{remaining} of {max} characters remaining"
/>
```

### Translation Management

Used in translation tabs for managing multilingual content with proper validation.

```vue
<AppTextArea
  v-model="translationData.description"
  label="English Description"
  info-message="This will be translated into other languages"
  :maxlength="2000"
  required
/>
```

## Features

- **Character Counting**: Real-time character count with customizable display text
- **Length Validation**: Built-in maxlength validation with custom error messages
- **Copy Functionality**: Optional copy-to-clipboard button for readonly content
- **Rich Validation**: Integration with Vuelidate for comprehensive form validation
- **Accessibility**: Full ARIA support with proper labeling and error associations
- **Responsive Design**: Adapts to different screen sizes and contexts

## Props

### Basic Props

- `modelValue`: The textarea value (used with v-model)
- `label`: Label text for the textarea
- `name`: Name attribute for the textarea (defaults to 'unknown')

### Validation Props

- `required`: Whether the field is required
- `maxlength`: Maximum number of characters allowed
- `requiredErrorText`: Custom text for required field validation errors
- `maxLengthErrorText`: Custom text for max length validation errors (supports `{max}` placeholder)

### UI Props

- `disabled`: Whether the textarea is disabled
- `copyable`: Whether to show a copy button for the content
- `infoMessage`: Help text displayed below the textarea
- `characterCountText`: Custom text for character count display (supports `{remaining}` and `{max}` placeholders)

## Character Count Feature

The component automatically displays a character count when `maxlength` is set:

```vue
<AppTextArea
  v-model="bio"
  :maxlength="150"
  character-count-text="{remaining} characters remaining"
/>
```

The character count text supports placeholders:

- `{remaining}`: Number of characters remaining
- `{max}`: Maximum character limit

## Validation Integration

The component uses Vuelidate for validation and provides custom error messages:

```vue
<AppTextArea
  v-model="description"
  required
  :maxlength="200"
  required-error-text="This field is required"
  max-length-error-text="Must be no more than {max} characters"
/>
```

## Copy Functionality

For readonly or reference content, enable the copy feature:

```vue
<AppTextArea
  v-model="apiKey"
  label="API Key"
  copyable
  disabled
  info-message="Keep this secret and secure"
/>
```

## Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Error Association**: Errors are properly associated with the textarea
- **Focus Management**: Logical focus order and visible focus indicators
- **Keyboard Navigation**: Full keyboard accessibility support

## Error Handling

The component provides visual feedback for validation errors:

- Red border and background for invalid fields
- Error messages displayed below the textarea
- ARIA attributes for screen reader accessibility

## Styling States

- **Default**: Standard appearance with primary color scheme
- **Error**: Red border and background when validation fails
- **Disabled**: Grayed out with reduced opacity and cursor indication
- **Focus**: Enhanced shadow and border for clear focus indication

## Best Practices

### Character Limits

Set appropriate character limits based on the use case:

- **Social media**: 160-280 characters
- **Short descriptions**: 150-500 characters
- **Long content**: 1000-2000 characters

### Error Messages

Provide clear, actionable error messages:

```vue
required-error-text="Please provide a description"
max-length-error-text="Description must be under {max} characters"
```

### Progressive Enhancement

Use info messages to guide users:

```vue
info-message="This text appears when your content is shared on social media"
```
