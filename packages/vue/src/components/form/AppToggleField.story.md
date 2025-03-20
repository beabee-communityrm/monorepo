# AppToggleField

The `AppToggleField` component provides a labeled toggle switch with state-specific descriptions. It's designed for use in forms and settings pages where users need to enable or disable features.

## Features

- Combines a label and toggle switch in a single component
- Supports different descriptions for enabled and disabled states
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
  enabled-description="Feature is currently active"
  disabled-description="Feature is currently inactive"
/>
```

## Props

| Prop                  | Type      | Default     | Description                                           |
| --------------------- | --------- | ----------- | ----------------------------------------------------- |
| `modelValue`          | `boolean` | -           | Current state of the toggle (required)                |
| `label`               | `string`  | `undefined` | Label text for the toggle field                       |
| `enabledDescription`  | `string`  | `undefined` | Description text shown when toggle is enabled         |
| `disabledDescription` | `string`  | `undefined` | Description text shown when toggle is disabled        |
| `variant`             | `string`  | `'primary'` | Color variant. Options: `primary`, `link`, `danger`   |
| `size`                | `string`  | `'default'` | Size of the toggle field. Options: `default`, `small` |
| `disabled`            | `boolean` | `false`     | Whether the toggle field is disabled                  |
| `required`            | `boolean` | `false`     | Whether the field is required                         |

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
  enabled-description="Feature is currently active"
  disabled-description="Feature is currently inactive"
/>
```

### With Different Variants

```vue
<AppToggleField
  v-model="enabled"
  variant="primary"
  label="Primary Toggle"
  enabled-description="Primary toggle is enabled"
  disabled-description="Primary toggle is disabled"
/>

<AppToggleField
  v-model="enabled"
  variant="link"
  label="Link Toggle"
  enabled-description="Link toggle is enabled"
  disabled-description="Link toggle is disabled"
/>

<AppToggleField
  v-model="enabled"
  variant="danger"
  label="Danger Toggle"
  enabled-description="Danger toggle is enabled"
  disabled-description="Danger toggle is disabled"
/>
```

### With Different Sizes

```vue
<AppToggleField
  v-model="enabled"
  size="default"
  label="Default Size"
  enabled-description="Default size toggle is enabled"
  disabled-description="Default size toggle is disabled"
/>

<AppToggleField
  v-model="enabled"
  size="small"
  label="Small Size"
  enabled-description="Small size toggle is enabled"
  disabled-description="Small size toggle is disabled"
/>
```

### Required Field

```vue
<AppToggleField
  v-model="enabled"
  label="Required Toggle"
  enabled-description="Required toggle is enabled"
  disabled-description="Required toggle is disabled"
  required
/>
```

### Disabled State

```vue
<AppToggleField
  v-model="enabled"
  label="Disabled Toggle"
  enabled-description="Toggle is enabled but can't be changed"
  disabled-description="Toggle is disabled and can't be changed"
  disabled
/>
```

## Real-world Examples

The AppToggleField is commonly used for:

1. **Feature Toggles**

```vue
<AppToggleField
  v-model="notificationsEnabled"
  label="Enable Notifications"
  enabled-description="You will receive notifications about updates and activity"
  disabled-description="You will not receive any notifications"
/>
```

2. **Theme Switching**

```vue
<AppToggleField
  v-model="darkModeEnabled"
  label="Dark Mode"
  enabled-description="Using dark theme for low-light environments"
  disabled-description="Using light theme for standard environments"
/>
```

3. **Auto-save Settings**

```vue
<AppToggleField
  v-model="autoSaveEnabled"
  label="Auto-save"
  enabled-description="Changes are automatically saved as you work"
  disabled-description="You need to manually save your changes"
/>
```

## How It Works

The AppToggleField component:

1. Combines an AppLabel and AppToggleSwitch in a single component
2. Shows different descriptions based on the current toggle state
3. Arranges the label and description on the left, with the toggle switch on the right
4. Handles the v-model binding to make it easy to use in forms
5. Adjusts text size based on the selected size variant

This creates a consistent and accessible toggle field component that provides clear feedback about its current state through state-specific descriptions.
