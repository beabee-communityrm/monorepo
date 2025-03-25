# AppRadioGroup

The `AppRadioGroup` component provides a styled radio button group with customizable appearance and variant support. It's designed to be used in forms where users need to make a single selection from multiple options.

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

## Props

| Prop         | Type                          | Default     | Description                                         |
| ------------ | ----------------------------- | ----------- | --------------------------------------------------- |
| `modelValue` | `string \| boolean \| number` | `null`      | Currently selected value                            |
| `options`    | `Array<[value, label]>`       | `required`  | Array of value-label pairs for options              |
| `name`       | `string`                      | `random`    | Name attribute for radio inputs                     |
| `label`      | `string`                      | `undefined` | Label text for the radio group                      |
| `variant`    | `string`                      | `'link'`    | Color variant. Options: `primary`, `link`, `danger` |
| `disabled`   | `boolean`                     | `false`     | Whether the radio group is disabled                 |
| `required`   | `boolean`                     | `false`     | Whether a selection is required                     |
| `inline`     | `boolean`                     | `false`     | Whether to display options inline horizontally      |

## Events

| Event               | Description                    |
| ------------------- | ------------------------------ |
| `update:modelValue` | Emitted when selection changes |

## Examples

### Basic Usage

```vue
<AppRadioGroup
  v-model="selectedOption"
  :options="[
    ['yes', 'Yes'],
    ['no', 'No'],
    ['maybe', 'Maybe'],
  ]"
  label="Would you recommend this product?"
/>
```

### With Different Variants

```vue
<AppRadioGroup
  v-model="selectedOption"
  :options="[
    ['option1', 'Option 1'],
    ['option2', 'Option 2'],
  ]"
  variant="primary"
  label="Primary variant radio group"
/>
```

### With Inline Layout

```vue
<AppRadioGroup
  v-model="selectedOption"
  :options="[
    ['small', 'Small'],
    ['medium', 'Medium'],
    ['large', 'Large'],
  ]"
  label="Select size"
  inline
/>
```

### Required Selection

```vue
<AppRadioGroup
  v-model="selectedOption"
  :options="[
    ['yes', 'Yes'],
    ['no', 'No'],
  ]"
  label="Do you agree? (required)"
  required
/>
```

## Real-world Examples

The AppRadioGroup is commonly used for:

1. **Gender Selection**

```vue
<AppRadioGroup
  v-model="gender"
  :options="[
    ['male', 'Male'],
    ['female', 'Female'],
    ['other', 'Other'],
    ['prefer-not', 'Prefer not to say'],
  ]"
  label="Gender"
  variant="primary"
/>
```

2. **Subscription Plans**

```vue
<AppRadioGroup
  v-model="plan"
  :options="[
    ['free', 'Free Plan'],
    ['standard', 'Standard Plan'],
    ['premium', 'Premium Plan'],
  ]"
  label="Subscription Plan"
  required
/>
```

3. **Contact Preferences**

```vue
<AppRadioGroup
  v-model="contactMethod"
  :options="[
    ['email', 'Email'],
    ['phone', 'Phone'],
    ['mail', 'Mail'],
  ]"
  label="Preferred Contact Method"
  inline
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
