# AppRadioInput

The `AppRadioInput` component provides a single styled radio button with customizable appearance and variant support. It's designed to be used either directly or within radio groups.

## Features

- Custom styled radio button with a clean, modern appearance
- Multiple color variants (primary, link, danger)
- Support for disabled state
- Support for required fields
- Proper focus and hover states for better accessibility

## Usage

```vue
<AppRadioInput
  v-model="selection"
  name="radio-option"
  value="option1"
  variant="primary"
>
  Radio option label
</AppRadioInput>
```

## Props

| Prop           | Type                          | Default     | Description                                   |
| -------------- | ----------------------------- | ----------- | --------------------------------------------- |
| `modelValue`   | `string \| boolean \| number` | `null`      | Currently selected value                      |
| `value`        | `string \| boolean \| number` | `required`  | Value of this radio option                    |
| `name`         | `string`                      | `required`  | Name attribute for radio input                |
| `label`        | `string`                      | `undefined` | Label text for this radio option              |
| `wrapperClass` | `string`                      | `''`        | CSS class for the wrapper element             |
| `variant`      | `string`                      | `'link'`    | Color variant: `primary`, `link`, or `danger` |
| `disabled`     | `boolean`                     | `false`     | Whether the radio input is disabled           |
| `required`     | `boolean`                     | `false`     | Whether a selection is required               |

## Events

| Event               | Description                    |
| ------------------- | ------------------------------ |
| `update:modelValue` | Emitted when selection changes |

## Examples

### Basic Usage

```vue
<AppRadioInput v-model="selection" name="options" value="yes">
  Yes
</AppRadioInput>

<AppRadioInput v-model="selection" name="options" value="no">
  No
</AppRadioInput>
```

### With Different Variants

```vue
<AppRadioInput
  v-model="selection"
  name="options"
  value="option1"
  variant="primary"
>
  Primary variant
</AppRadioInput>

<AppRadioInput
  v-model="selection"
  name="options"
  value="option2"
  variant="danger"
>
  Danger variant
</AppRadioInput>
```
