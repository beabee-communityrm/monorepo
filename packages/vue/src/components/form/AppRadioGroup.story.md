# AppRadioGroup

The `AppRadioGroup` component provides a group of radio buttons for single-choice selection with consistent styling and validation.

## Usage Patterns

- **Single choice options** - Select one option from multiple choices
- **Preference selection** - Choose user preferences like themes or languages
- **Configuration options** - Pick system settings or display modes
- **Survey questions** - Single-answer questions with multiple options

## Key Features

- ✅ **Exclusive selection** - Only one option can be selected at a time
- ✅ **Group validation** - Shared validation state across all radio buttons
- ✅ **Flexible layouts** - Supports vertical and horizontal arrangements
- ✅ **Accessibility** - Proper radio group semantics and keyboard navigation

## Features

- Custom styled radio buttons with a clean, modern appearance
- Multiple color variants (primary, link, danger)
- Support for disabled state
- Support for required fields
- Inline or stacked layout options
- Proper focus and hover states for better accessibility

## Usage

```vue
<AppRadioGroup
  v-model="selectedOption"
  :options="[
    ['option1', 'Option 1'],
    ['option2', 'Option 2'],
    ['option3', 'Option 3'],
  ]"
  label="Select an option"
  variant="link"
/>
```

## How It Works

The AppRadioGroup component:

1. Uses hidden native radio inputs for accessibility
2. Displays custom-styled visual radio buttons with different states
3. Shows a colored dot when a radio option is selected
4. Uses the selected variant color for the border and dot
5. Provides hover and focus states for better user experience
6. Maintains proper vertical alignment between the radio button and label
7. Handles the selection state automatically

This creates a consistent and accessible radio button group component that integrates well with other form elements while providing customization options.
