# AppSlider

A slider component that allows you to slide between elements. Useful for things like modals with multiple steps, carousels, or any multi-step user interface.

## Features

- **Smooth Scrolling**: Native smooth scrolling between slides with `scroll-behavior: smooth`
- **Optional Infinite Scrolling**: Allow continuous navigation in a loop
- **Integrated Stepper**: Optional stepper navigation when steps are provided
- **Custom Navigation**: Flexible navigation slot with full control over navigation UI
- **Responsive Design**: Handles window resize events to maintain slide positioning
- **Accessibility**: ARIA attributes, semantic HTML, and screen reader support
- **Programmatic Control**: Exposed methods for external navigation control

## Props

| Prop        | Type                               | Default            | Description                                        |
| ----------- | ---------------------------------- | ------------------ | -------------------------------------------------- |
| `infinite`  | `boolean`                          | `false`            | Whether to allow infinite scrolling between slides |
| `steps`     | `AppStepperStep[]`                 | `undefined`        | Optional steps to display in stepper navigation    |
| `disabled`  | `boolean`                          | `false`            | Whether the slider navigation is disabled          |
| `ariaLabel` | `string`                           | `'Content slider'` | Accessible label for the slider                    |
| `ariaLive`  | `'off' \| 'polite' \| 'assertive'` | `'polite'`         | ARIA live region behavior for slide changes        |

## Events

| Event   | Type                         | Description                                                            |
| ------- | ---------------------------- | ---------------------------------------------------------------------- |
| `slide` | `AppSliderSlideEventDetails` | Emitted when a slide changes. Contains slide numbers and slide element |

## Slots

| Slot         | Required | Description                                                    |
| ------------ | -------- | -------------------------------------------------------------- |
| `slides`     | ✅       | The slides to display in the slider (use AppSlide components)  |
| `navigation` | ❌       | Custom navigation controls with access to navigation functions |

### Navigation Slot Props

The `navigation` slot receives these props:

```typescript
{
  prevSlide: (behavior?: ScrollBehavior) => void;
  nextSlide: (behavior?: ScrollBehavior) => void;
  toSlide: (slideNumber: number, behavior?: ScrollBehavior) => void;
  isFirstSlide: boolean;
  isLastSlide: boolean;
  slideCount: number;
  activeSlide: number;
}
```

## Exposed Methods

The component exposes these methods via `defineExpose`:

```typescript
{
  prevSlide: (behavior?: ScrollBehavior) => void;
  nextSlide: (behavior?: ScrollBehavior) => void;
  toSlide: (slideNumber: number, behavior?: ScrollBehavior) => void;
  isFirstSlide: ComputedRef<boolean>;
  isLastSlide: ComputedRef<boolean>;
  slideCount: ComputedRef<number>;
  activeSlide: Ref<number>;
}
```

## Examples

### Basic Slider

```vue
<AppSlider @slide="onSlideChange">
  <template #slides>
    <AppSlide>
      <div class="p-8">Content for slide 1</div>
    </AppSlide>
    <AppSlide>
      <div class="p-8">Content for slide 2</div>
    </AppSlide>
    <AppSlide>
      <div class="p-8">Content for slide 3</div>
    </AppSlide>
  </template>
</AppSlider>
```

### With Stepper Navigation

```vue
<AppSlider
  :steps="[
    { name: 'Introduction', validated: true, error: false },
    { name: 'Details', validated: false, error: false },
    { name: 'Confirmation', validated: false, error: false },
  ]"
  @slide="onSlideChange"
>
  <template #slides>
    <AppSlide><!-- Introduction content --></AppSlide>
    <AppSlide><!-- Details content --></AppSlide>
    <AppSlide><!-- Confirmation content --></AppSlide>
  </template>
</AppSlider>
```

### With Custom Navigation

```vue
<AppSlider :infinite="true" @slide="onSlideChange">
  <template #slides>
    <AppSlide><!-- Slide content --></AppSlide>
    <AppSlide><!-- Slide content --></AppSlide>
    <AppSlide><!-- Slide content --></AppSlide>
  </template>

  <template #navigation="{ prevSlide, nextSlide, isFirstSlide, isLastSlide, activeSlide, slideCount }">
    <div class="flex justify-between mt-4">
      <button @click="prevSlide()" :disabled="isFirstSlide">Previous</button>
      <span>{{ activeSlide + 1 }} of {{ slideCount }}</span>
      <button @click="nextSlide()" :disabled="isLastSlide">Next</button>
    </div>
  </template>
</AppSlider>
```

### Programmatic Control

```vue
<template>
  <AppSlider ref="sliderRef" @slide="onSlideChange">
    <template #slides>
      <AppSlide><!-- Content --></AppSlide>
      <AppSlide><!-- Content --></AppSlide>
      <AppSlide><!-- Content --></AppSlide>
    </template>
  </AppSlider>

  <button @click="goToSlide(1)">Go to slide 2</button>
</template>

<script setup>
import { ref } from 'vue';

const sliderRef = ref(null);

const goToSlide = (slideNumber) => {
  sliderRef.value?.toSlide(slideNumber);
};
</script>
```

## Types

### AppSliderSlideEventDetails

```typescript
interface AppSliderSlideEventDetails {
  slideNumber: number; // The new slide number (0-based)
  oldSlideNumber: number; // The previous slide number (0-based)
  slideEl: HTMLElement; // The HTML element of the new slide
}
```

## Accessibility

- Uses `role="region"` for the main slider container
- `role="tabpanel"` for the slides container with descriptive labels
- `aria-live` regions for announcing slide changes to screen readers
- Integrates with AppStepper for keyboard navigation
- Supports custom `aria-label` and `aria-live` configuration

## Browser Compatibility

- **Safari**: Requires [smoothscroll-polyfill](https://github.com/iamdustan/smoothscroll) for smooth scrolling animation
- **Modern Browsers**: Full support for all features
- **Resize Handling**: Automatic repositioning on window resize

## Best Practices

1. **Slide Content**: Use AppSlide components for consistent styling
2. **Performance**: Avoid heavy content in non-visible slides
3. **Accessibility**: Provide meaningful step names when using stepper navigation
4. **Mobile**: Consider touch/swipe support for mobile users (future enhancement)
5. **Loading**: Handle loading states for dynamic slide content
6. **Error Handling**: Implement proper error boundaries for slide content

## Possible Improvements

- Add support for touch/swipe navigation
- Add keyboard navigation (arrow keys, home/end)
- Add slide indicators/dots
- Add autoplay functionality
- Add lazy loading for slide content

## Related Components

- **AppSlide**: Individual slide wrapper component
- **AppStepper**: Navigation stepper component (used internally when steps provided)
