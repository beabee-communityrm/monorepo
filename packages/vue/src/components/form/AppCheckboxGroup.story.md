# AppCheckboxGroup

The `AppCheckboxGroup` component provides a way to group multiple checkboxes together for selecting multiple options from a list. It's designed for use in forms where users need to select one or more items from a predefined set of options.

## Features

- Groups multiple checkbox options in a clean layout
- Handles multi-selection states automatically
- Support for a group label
- Support for required validation (at least one option must be selected)
- Consistent styling with the AppCheckbox component
- Proper model binding for array values

## Usage

```vue
<AppCheckboxGroup
  v-model="selectedOptions"
  :options="[
    { id: 'option1', label: 'Option 1' },
    { id: 'option2', label: 'Option 2' },
    { id: 'option3', label: 'Option 3' }
  ]"
  label="Select options"
/>
```

## Props

| Prop         | Type                      | Default     | Description                                       |
| ------------ | ------------------------- | ----------- | ------------------------------------------------- |
| `modelValue` | `Array<string \| number>` | `[]`        | Array of selected option IDs                      |
| `options`    | `Array<SelectItem<T>>`    | `[]`        | Array of options to display                       |
| `label`      | `string`                  | `undefined` | Label text for the checkbox group                 |
| `inline`     | `boolean`                 | `false`     | Whether to display checkboxes inline horizontally |
| `required`   | `boolean`                 | `false`     | Whether at least one option must be selected      |

## Events

| Event               | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| `update:modelValue` | Emitted when selected options change, with array of selected IDs |

## Examples

### Basic Usage

```vue
<AppCheckboxGroup
  v-model="selectedFruits"
  :options="[
    { id: 'apple', label: 'Apple' },
    { id: 'banana', label: 'Banana' },
    { id: 'orange', label: 'Orange' }
  ]"
  label="Select fruits"
/>
```

### Required Selection

```vue
<AppCheckboxGroup
  v-model="selectedCategories"
  :options="[
    { id: 'news', label: 'News' },
    { id: 'sports', label: 'Sports' },
    { id: 'entertainment', label: 'Entertainment' }
  ]"
  label="Select at least one category"
  required
/>
```

### Numeric IDs

```vue
<AppCheckboxGroup
  v-model="selectedProductIds"
  :options="[
    { id: 1, label: 'Product 1' },
    { id: 2, label: 'Product 2' },
    { id: 3, label: 'Product 3' }
  ]"
  label="Select products"
/>
```

## Real-world Examples

The AppCheckboxGroup is commonly used for:

1. **Category Selection**
```vue
<AppCheckboxGroup
  v-model="selectedCategories"
  :options="[
    { id: 'news', label: 'News' },
    { id: 'sports', label: 'Sports' },
    { id: 'tech', label: 'Technology' },
    { id: 'health', label: 'Health' }
  ]"
  label="Interests"
  required
/>
```

2. **Multiple Feature Selection**
```vue
<AppCheckboxGroup
  v-model="enabledFeatures"
  :options="[
    { id: 'notifications', label: 'Email Notifications' },
    { id: 'newsletter', label: 'Weekly Newsletter' },
    { id: 'updates', label: 'Product Updates' }
  ]"
  label="Communication Preferences"
/>
```

3. **Terms Acceptance**
```vue
<AppCheckboxGroup
  v-model="agreements"
  :options="[
    { id: 'terms', label: 'I accept the Terms of Service' },
    { id: 'privacy', label: 'I accept the Privacy Policy' },
    { id: 'marketing', label: 'I would like to receive marketing emails' }
  ]"
  label="Agreements"
  required
/>
```

## How It Works

The AppCheckboxGroup component:

1. Presents multiple AppCheckbox components within a container
2. Maintains an array of selected option IDs in its model value
3. Handles adding and removing IDs from the array when checkboxes are toggled
4. Supports validation to ensure at least one option is selected when required
5. Provides a consistent interface for working with multiple selections

This creates a consistent and accessible checkbox group component that simplifies working with multiple selection scenarios. 
