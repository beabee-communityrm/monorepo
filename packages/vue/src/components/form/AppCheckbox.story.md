# AppCheckbox

The `AppCheckbox` component provides a styled checkbox with customizable appearance and variant support for forms and interactive elements.

## Usage Patterns

- **Terms acceptance** - Legal agreements with required validation
- **Preference selection** - User settings and notification options
- **Feature toggles** - Enable/disable application features
- **List selections** - Multiple item selection in forms

## Key Features

- ✅ **Custom styling** - Consistent visual design across variants
- ✅ **Three color variants** - Primary, link, and danger color schemes
- ✅ **Optional icons** - Support for FontAwesome icons alongside labels
- ✅ **Validation support** - Built-in required field validation with Vuelidate

## Features

- Custom styled checkbox with a clean, modern appearance
- Multiple color variants (primary, link, danger)
- Support for disabled state
- Support for required fields
- Optional icon support alongside the label
- Proper focus and hover states for better accessibility
- Vertical alignment between checkbox and label

## Usage

```vue
<AppCheckbox
  v-model="isChecked"
  label="Accept terms and conditions"
  variant="link"
/>
```

## Props

| Prop         | Type             | Default     | Description                                         |
| ------------ | ---------------- | ----------- | --------------------------------------------------- |
| `modelValue` | `boolean`        | `false`     | Current state of the checkbox                       |
| `label`      | `string`         | `''`        | Label text for the checkbox                         |
| `icon`       | `IconDefinition` | `undefined` | Optional icon to display alongside the label        |
| `variant`    | `string`         | `'link'`    | Color variant. Options: `primary`, `link`, `danger` |
| `disabled`   | `boolean`        | `false`     | Whether the checkbox is disabled                    |
| `required`   | `boolean`        | `false`     | Whether the checkbox is required                    |

## Events

| Event               | Description                             |
| ------------------- | --------------------------------------- |
| `update:modelValue` | Emitted when the checkbox state changes |

## How It Works

The AppCheckbox component:

1. Uses a hidden native checkbox input for accessibility
2. Displays a custom-styled visual checkbox with different states
3. Shows the check mark using a Font Awesome icon when checked
4. Uses the selected variant color for the border and check icon
5. Provides hover and focus states for better user experience
6. Maintains proper vertical alignment between the checkbox and label

This creates a consistent and accessible checkbox component that integrates well with other form elements while providing customization options.
