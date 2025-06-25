# AppToggleField

The `AppToggleField` component combines a toggle switch with label and description in a complete form field layout.

## Usage Patterns

- **Settings forms** - Enable/disable features with descriptive context
- **Preference toggles** - User options with explanatory text
- **Permission controls** - Access toggles with clear descriptions
- **Feature flags** - Development and admin feature controls

## Key Features

- ✅ **Complete field layout** - Label, toggle, and description in one component
- ✅ **Validation support** - Integrated form validation and error display
- ✅ **Accessibility** - Proper label associations and ARIA attributes
- ✅ **Consistent styling** - Matches other form field components

## Usage

```vue
<AppToggleField
  v-model="enabled"
  label="Enable Feature"
  enabled-description="Feature is currently active"
  disabled-description="Feature is currently inactive"
/>
```
