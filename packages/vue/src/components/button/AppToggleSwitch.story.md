# AppToggleSwitch

The `AppToggleSwitch` component provides a toggle switch for binary choices as a visual alternative to checkboxes.

## Usage Patterns

- **Settings toggles** - Enable/disable features or preferences
- **Visibility controls** - Show/hide content or UI elements
- **Mode switches** - Dark/light mode, public/private settings
- **Feature flags** - Toggle experimental or optional features

## Key Features

- ✅ **Multiple variants** - Primary, link, and danger color schemes
- ✅ **Two sizes** - Default and small for different contexts  
- ✅ **Smooth animations** - 200ms transition for state changes
- ✅ **Accessibility** - Proper ARIA attributes and keyboard support

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

## How It Works

The AppToggleSwitch component:

1. Renders a button with the `role="switch"` attribute for accessibility
2. Uses the `modelValue` prop to determine the current state
3. Applies different styles based on the current state, variant, and size
4. Emits an `update:modelValue` event when clicked to toggle the state
5. Handles disabled state to prevent interaction when needed

This creates a consistent and accessible toggle switch component that can be used throughout the application.
