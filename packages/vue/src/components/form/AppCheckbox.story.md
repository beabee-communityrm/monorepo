# AppCheckbox

The `AppCheckbox` component provides a styled checkbox with customizable appearance and variant support. It's designed to be used in forms and other interactive elements where users need to make binary choices.

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

## Examples

### Basic Usage

```vue
<AppCheckbox
  v-model="isChecked"
  label="Accept terms and conditions"
/>
```

### With Different Variants

```vue
<AppCheckbox
  v-model="isChecked"
  variant="primary"
  label="Primary checkbox"
/>

<AppCheckbox
  v-model="isChecked"
  variant="link"
  label="Link checkbox"
/>

<AppCheckbox
  v-model="isChecked"
  variant="danger"
  label="Danger checkbox"
/>
```

### With Icon

```vue
<AppCheckbox
  v-model="isChecked"
  label="Notifications"
  :icon="faBell"
/>
```

### Required Field

```vue
<AppCheckbox
  v-model="isChecked"
  label="Accept terms (required)"
  required
/>
```

### Disabled State

```vue
<AppCheckbox
  v-model="isChecked"
  label="Disabled checkbox"
  disabled
/>
```

## Real-world Examples

The AppCheckbox is commonly used for:

1. **Terms and Conditions Acceptance**
```vue
<AppCheckbox
  v-model="acceptTerms"
  label="I accept the terms and conditions"
  required
  variant="primary"
/>
```

2. **Preference Selection**
```vue
<AppCheckbox
  v-model="emailNotifications"
  label="Subscribe to email notifications"
  variant="link"
/>
```

3. **Feature Toggle**
```vue
<AppCheckbox
  v-model="advancedMode"
  label="Enable advanced features"
/>
```

## How It Works

The AppCheckbox component:

1. Uses a hidden native checkbox input for accessibility
2. Displays a custom-styled visual checkbox with different states
3. Shows the check mark using a Font Awesome icon when checked
4. Uses the selected variant color for the border and check icon
5. Provides hover and focus states for better user experience
6. Maintains proper vertical alignment between the checkbox and label

This creates a consistent and accessible checkbox component that integrates well with other form elements while providing customization options. 
