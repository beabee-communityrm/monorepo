# AppColorInput

A color picker component that combines a text input for hex values with an interactive color picker widget. Provides an intuitive interface for selecting colors with real-time preview and validation.

## Use Cases

### Theme Configuration

Used in admin settings for configuring website theme colors, allowing administrators to customize the visual appearance of the site.

```vue
<AppColorInput v-model="customColors.primary" id="primary-color" />
```

The component is primarily used in the theme settings page where users can:

- Select primary brand colors
- Configure accent colors
- Set custom theme variations
- Preview color changes in real-time

## Features

- **Dual Input Method**: Text input for precise hex values and visual color picker for intuitive selection
- **Real-time Preview**: Color swatch shows the current selection immediately
- **Validation Integration**: Uses Vuelidate for hex color format validation
- **Alpha Channel Support**: Handles both 3-digit (#RGB) and 6-digit (#RRGGBB) hex formats
- **Accessible Design**: Proper labeling and keyboard navigation support

## Props

### Required Props

- `id`: Unique identifier for the color picker widget
- `modelValue`: The current hex color value (used with v-model)

## Color Format Support

The component supports standard hex color formats:

- **3-digit hex**: `#RGB` (e.g., `#f00` for red)
- **6-digit hex**: `#RRGGBB` (e.g., `#ff0000` for red)

Alpha channels are automatically stripped to maintain compatibility with CSS color values.

## Validation

Built-in validation ensures only valid hex color values are accepted:

- Pattern validation for proper hex format
- Real-time feedback during input
- Integration with form validation systems

## Color Picker Widget

The component uses `vue-accessible-color-picker` for the visual picker:

- Accessible color selection interface
- Keyboard navigation support
- Format switching capabilities (hidden by default)
- Touch-friendly for mobile devices

## Styling Customization

The color picker appearance is customized with CSS variables:

- Transparent background integration
- Inherited font family
- Hidden copy and input elements for cleaner UI
- High specificity styles for production builds

## Technical Implementation

- **Text Input**: Uses `AppInput` component for consistency
- **Validation**: Vuelidate integration with pattern matching
- **State Management**: Reactive updates between text input and color picker
- **Event Handling**: Debounced updates to prevent excessive re-renders

## Best Practices

### Color Accessibility

Consider color contrast when implementing color pickers:

- Provide text alternatives for color-coded information
- Ensure sufficient contrast ratios
- Test with colorblind simulation tools

### User Experience

- Provide meaningful labels for each color input
- Group related colors logically
- Show preview of color applications when possible
- Allow color reset or default options

### Integration

The component works seamlessly with:

- Form validation systems
- Theme management utilities
- CSS custom property systems
- Design token workflows
