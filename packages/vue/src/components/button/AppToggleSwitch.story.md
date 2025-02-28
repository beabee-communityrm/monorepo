# AppToggleSwitch

The `AppToggleSwitch` component provides a toggle switch for binary choices. It's commonly used for enabling or disabling features, settings, or options.

## Features

- Multiple color variants (primary, link, danger)
- Different sizes (default, small)
- Support for disabled state
- Accessible with proper ARIA attributes
- Smooth transition animations

## Usage

```vue
<AppToggleSwitch v-model="enabled" />
```

## Props

| Prop         | Type      | Default     | Description                                            |
| ------------ | --------- | ----------- | ------------------------------------------------------ |
| `modelValue` | `boolean` | -           | Current state of the toggle switch (required)          |
| `variant`    | `string`  | `'primary'` | Color variant. Options: `primary`, `link`, `danger`    |
| `size`       | `string`  | `'default'` | Size of the toggle switch. Options: `default`, `small` |
| `disabled`   | `boolean` | `false`     | Whether the toggle switch is disabled                  |

## Events

| Event               | Description                           |
| ------------------- | ------------------------------------- |
| `update:modelValue` | Emitted when the switch state changes |

## Examples

### Basic Usage

```vue
<AppToggleSwitch v-model="enabled" />
```

### With Different Variants

```vue
<AppToggleSwitch v-model="enabled" variant="primary" />
<AppToggleSwitch v-model="enabled" variant="link" />
<AppToggleSwitch v-model="enabled" variant="danger" />
```

### With Different Sizes

```vue
<AppToggleSwitch v-model="enabled" size="default" />
<AppToggleSwitch v-model="enabled" size="small" />
```

### Disabled State

```vue
<AppToggleSwitch v-model="enabled" disabled />
```

### In a Form Field

The AppToggleSwitch is commonly used in the AppToggleField component:

```vue
<AppToggleField
  v-model="notifications"
  label="Enable Notifications"
  description="Receive notifications about updates and activity"
/>
```

## Real-world Examples

The AppToggleSwitch is used in several places throughout the application:

1. **User Settings** - For enabling/disabling features
2. **Notification Preferences** - For toggling different notification types
3. **Privacy Settings** - For opting in/out of data collection
4. **Display Options** - For toggling UI features like dark mode

## How It Works

The AppToggleSwitch component:

1. Renders a button with the `role="switch"` attribute for accessibility
2. Uses the `modelValue` prop to determine the current state
3. Applies different styles based on the current state, variant, and size
4. Emits an `update:modelValue` event when clicked to toggle the state
5. Handles disabled state to prevent interaction when needed

This creates a consistent and accessible toggle switch component that can be used throughout the application. 
