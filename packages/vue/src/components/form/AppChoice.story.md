# AppChoice

The `AppChoice` component provides a button group for selecting a single option from multiple choices. It's designed to be used in forms where users need to pick from a set of predefined options in a visually distinct, button-like interface.

## Features

- Clean, modern button group design with primary color scheme
- Multiple size variants (xs, sm)
- Support for disabled state
- Flexible generic typing for string or number values
- Responsive layout with flexible button sizing
- Hover and active states for better user experience

## Usage

```vue
<AppChoice
  v-model="selectedValue"
  :items="[
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ]"
  size="sm"
/>
```

## Props

| Prop         | Type                            | Default | Description                                    |
| ------------ | ------------------------------- | ------- | ---------------------------------------------- |
| `modelValue` | `T extends string \| number`    | -       | Currently selected value                       |
| `items`      | `Array<{label: string, value}>` | -       | Array of choice options with labels and values |
| `disabled`   | `boolean`                       | `false` | Whether the choice group is disabled           |
| `size`       | `'xs' \| 'sm'`                  | `'sm'`  | Size variant of the choice buttons             |

## Events

| Event               | Description                    |
| ------------------- | ------------------------------ |
| `update:modelValue` | Emitted when selection changes |

## Examples

### Basic Usage

```vue
<AppChoice
  v-model="selectedOption"
  :items="[
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
    { label: 'Maybe', value: 'maybe' },
  ]"
/>
```

### With Different Sizes

```vue
<!-- Small size (default) -->
<AppChoice v-model="selectedOption" :items="items" size="sm" />

<!-- Extra small size -->
<AppChoice v-model="selectedOption" :items="items" size="xs" />
```

### With Number Values

```vue
<AppChoice
  v-model="selectedAmount"
  :items="[
    { label: '€5', value: 5 },
    { label: '€10', value: 10 },
    { label: '€25', value: 25 },
    { label: '€50', value: 50 },
  ]"
  size="xs"
/>
```

### Disabled State

```vue
<AppChoice v-model="selectedOption" :items="items" disabled />
```

## Real-world Examples

The AppChoice is commonly used for:

1. **Contribution Amounts**

```vue
<AppChoice
  v-model="amount"
  :items="[
    { label: '€5', value: 5 },
    { label: '€10', value: 10 },
    { label: '€25', value: 25 },
    { label: '€50', value: 50 },
  ]"
  size="xs"
/>
```

2. **Payment Periods**

```vue
<AppChoice
  v-model="period"
  :items="[
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ]"
/>
```

3. **Frequency Settings**

```vue
<AppChoice
  v-model="frequency"
  :items="[
    { label: 'Daily', value: 1 },
    { label: 'Weekly', value: 7 },
    { label: 'Monthly', value: 30 },
  ]"
  size="xs"
/>
```

## How It Works

The AppChoice component:

1. Renders a flexible button group with rounded borders
2. Each button represents a selectable option
3. The selected button gets highlighted with the link color and white text
4. Non-selected buttons show hover effects for better UX
5. Uses generic TypeScript typing to support both string and number values
6. Automatically handles button sizing and responsiveness
7. Maintains proper spacing and visual hierarchy

This creates a modern, accessible choice component that works well for quick selections in forms and interfaces.
