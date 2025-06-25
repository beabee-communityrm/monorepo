# AppSlide

A single slide wrapper component for use within AppSlider. Provides consistent styling and layout for slider content.

## Features

- **Consistent Layout**: Provides standardized wrapper for slide content
- **Full Width**: Takes the full width and height of the slider container
- **Flex None**: Prevents slides from shrinking in flex containers
- **Accessibility**: Built-in ARIA support with customizable labels
- **Semantic HTML**: Uses proper group role for screen readers

## Usage

AppSlide is typically used as a container for individual slide content within AppSlider components. Each slide should contain a single piece of content or a cohesive group of related content.

## Props

| Prop                  | Type     | Default     | Description                         |
| --------------------- | -------- | ----------- | ----------------------------------- |
| `ariaLabel`           | `string` | `undefined` | Accessible label for the slide      |
| `ariaRoleDescription` | `string` | `'slide'`   | ARIA role description for the slide |

## Slots

| Slot      | Description                         |
| --------- | ----------------------------------- |
| `default` | Content to display within the slide |

## Examples

### Basic Usage

```vue
<AppSlide>
  <div class="p-8 text-center">
    <h3>Slide Title</h3>
    <p>Slide content goes here.</p>
  </div>
</AppSlide>
```

### With Accessibility Labels

```vue
<AppSlide
  aria-label="Product information slide"
  aria-role-description="informational slide"
>
  <div class="p-6">
    <h3>Product Details</h3>
    <p>Information about our product...</p>
  </div>
</AppSlide>
```

### Image Content

```vue
<AppSlide aria-label="Product gallery image">
  <img 
    src="/product-image.jpg" 
    alt="Product showcase"
    class="w-full h-auto"
  />
</AppSlide>
```

## Accessibility

- Uses `role="group"` for proper semantic meaning
- Supports custom `aria-label` for screen readers
- Configurable `aria-role-description` for context
- Works well with keyboard navigation when used in AppSlider

## Best Practices

1. **Content Focus**: Keep each slide focused on a single topic or concept
2. **Consistent Height**: Consider using consistent heights across slides for better UX
3. **Responsive Design**: Ensure slide content works well on all screen sizes
4. **Accessibility**: Always provide meaningful labels for slides with important content
5. **Loading States**: Handle loading states for dynamic content within slides

## Related Components

- **AppSlider**: The parent slider component that contains multiple AppSlide components
- **AppStepper**: Optional navigation component used with AppSlider
