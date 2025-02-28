# AppToggleField

The `AppToggleField` component provides a labeled toggle switch with an optional description. It's designed for use in forms and settings pages where users need to enable or disable features.

## Features

- Combines a label, description, and toggle switch in a single component
- Multiple color variants (primary, link, danger)
- Different sizes (default, small)
- Support for disabled state
- Support for required fields
- Responsive layout with proper spacing

## Usage

```vue
<AppToggleField
  v-model="enabled"
  label="Enable Feature"
  description="This will enable the feature for your account"
/>
```

## Props

| Prop          | Type      | Default     | Description                                           |
| ------------- | --------- | ----------- | ----------------------------------------------------- |
| `modelValue`  | `boolean` | -           | Current state of the toggle (required)                |
| `label`       | `string`  | `undefined` | Label text for the toggle field                       |
| `description` | `string`  | `undefined` | Additional descriptive text below the label           |
| `variant`     | `string`  | `'primary'` | Color variant. Options: `primary`, `link`, `danger`   |
| `size`        | `string`  | `'default'` | Size of the toggle field. Options: `default`, `small` |
| `disabled`    | `boolean` | `false`     | Whether the toggle field is disabled                  |
| `required`    | `boolean` | `false`     | Whether the field is required                         |

## Events

| Event               | Description                           |
| ------------------- | ------------------------------------- |
| `update:modelValue` | Emitted when the toggle state changes |

## Examples

### Basic Usage

```vue
<AppToggleField
  v-model="enabled"
  label="Enable Feature"
  description="This will enable the feature for your account"
/>
```

### With Different Variants

```vue
<AppToggleField
  v-model="enabled"
  variant="primary"
  label="Primary Toggle"
  description="This uses the primary color"
/>

<AppToggleField
  v-model="enabled"
  variant="link"
  label="Link Toggle"
  description="This uses the link color"
/>

<AppToggleField
  v-model="enabled"
  variant="danger"
  label="Danger Toggle"
  description="This uses the danger color"
/>
```

### With Different Sizes

```vue
<AppToggleField
  v-model="enabled"
  size="default"
  label="Default Size"
  description="This uses the default size"
/>

<AppToggleField
  v-model="enabled"
  size="small"
  label="Small Size"
  description="This uses the small size"
/>
```

### Required Field

```vue
<AppToggleField
  v-model="enabled"
  label="Required Toggle"
  description="This field is required"
  required
/>
```

### Disabled State

```vue
<AppToggleField
  v-model="enabled"
  label="Disabled Toggle"
  description="This toggle is disabled"
  disabled
/>
```

## Real-world Examples

The AppToggleField is used in several places throughout the application:

1. **User Settings** - For enabling/disabling features and preferences
2. **Content Management** - For toggling visibility of advanced options
3. **Form Builder** - For enabling/disabling specific form behaviors
4. **Admin Panels** - For configuring system settings

## How It Works

The AppToggleField component:

1. Combines an AppLabel, description text, and AppToggleSwitch in a single component
2. Arranges the label and description on the left, with the toggle switch on the right
3. Passes the appropriate props to the underlying AppToggleSwitch component
4. Handles the v-model binding to make it easy to use in forms
5. Adjusts text size based on the selected size variant

This creates a consistent and accessible toggle field component that can be used throughout the application.
