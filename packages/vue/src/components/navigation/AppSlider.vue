<!--
  # AppSlider
  A slider component that allows you to slide between elements. 
  Useful for things like modals with multiple steps or a carousel.

  ## Features
  - Smooth scrolling between slides
  - Optional infinite scrolling
  - Integrated stepper navigation when steps are provided
  - Custom navigation slot support
  - Responsive design with resize handling
  - Accessibility support with ARIA attributes and keyboard navigation
  - Programmatic navigation methods

  ## Props
  - `infinite` (boolean): Whether to allow infinite scrolling. Defaults to `false`.
  - `steps` (AppStepperStep[], optional): Steps to display in stepper. If provided, stepper navigation will be shown.
  - `disabled` (boolean, optional): Whether the slider is disabled. Defaults to `false`.
  - `ariaLabel` (string, optional): Accessible label for the slider. Defaults to `'Content slider'`.
  - `ariaLive` (string, optional): ARIA live region behavior. Defaults to `'polite'`.
  - `disableKeyboardNavigation` (boolean, optional): Whether to disable keyboard navigation. Defaults to `false`.

  ## Events
  - `slide` (details: AppSliderSlideEventDetails): Emitted when a slide is scrolled to. 
    `details` contains the slide number and the slide element.

  ## Keyboard Navigation
  - `Arrow Left/Right`: Navigate to previous/next slide
  - `Home`: Navigate to first slide
  - `End`: Navigate to last slide

  ## Slots
  - `slides` (Required): The slides to display in the slider.
  - `navigation` (Optional): Custom navigation buttons. Receives the `prevSlide`, `nextSlide`, 
    and `toSlide` functions as props.

  ## Note
  - To get the slide animation working on Safari you need a polyfill for `scroll-behavior: smooth`. 
    I recommend [smoothscroll-polyfill](https://github.com/iamdustan/smoothscroll)

  ## Possible improvements
  - Add support for touch (scrolling by swiping)
  - Add support for indicators
  - Add support for auto-play functionality
-->
<template>
  <div
    class="w-full"
    role="region"
    :aria-label="ariaLabel"
    :aria-live="ariaLive"
    @keydown="handleKeydown"
    tabindex="0"
  >
    <!-- Optional stepper navigation -->
    <AppStepper
      v-if="steps && steps.length > 0"
      v-model="activeSlide"
      class="justify-center"
      :steps="steps"
      :disabled="disabled"
      @update:model-value="onStepperChange"
    />

    <!-- Slides container -->
    <div
      ref="slidesContainerEl"
      class="flex w-full flex-nowrap overflow-x-hidden whitespace-nowrap"
      role="tabpanel"
      :aria-label="`Slide ${activeSlide + 1} of ${slideCount}`"
    >
      <slot name="slides" />
    </div>

    <!-- Custom navigation slot -->
    <slot
      name="navigation"
      :prev-slide="prevSlide"
      :next-slide="nextSlide"
      :to-slide="toSlide"
      :is-first-slide="isFirstSlide"
      :is-last-slide="isLastSlide"
      :slide-count="slideCount"
      :active-slide="activeSlide"
    />
  </div>
</template>

<script lang="ts" setup>
/**
 * A slider component that allows you to slide between elements.
 * Useful for things like modals with multiple steps or a carousel.
 *
 * @component AppSlider
 */
import type { Ref } from 'vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import type {
  AppSliderProps,
  AppSliderSlideEventDetails,
} from '../../types/slider';
import AppStepper from './AppStepper.vue';

const emit = defineEmits<{
  /**
   * Emitted when a slide is scrolled to
   * @param details - Contains slide number, old slide number, and slide element
   */
  slide: [details: AppSliderSlideEventDetails];
}>();

const props = withDefaults(
  defineProps<
    AppSliderProps & {
      /** Whether the slider is disabled */
      disabled?: boolean;
      /** Accessible label for the slider */
      ariaLabel?: string;
      /** ARIA live region behavior */
      ariaLive?: 'off' | 'polite' | 'assertive';
      /** Whether to disable keyboard navigation (Arrow keys, Home, End) */
      disableKeyboardNavigation?: boolean;
    }
  >(),
  {
    infinite: false,
    disabled: false,
    ariaLabel: 'Content slider',
    ariaLive: 'polite',
    disableKeyboardNavigation: false,
  }
);

/**
 * Slots available in the AppSlider component
 */
defineSlots<{
  /**
   * Required slot for the slides to display in the slider
   * @description Place AppSlide components here
   */
  slides(): any;
  /**
   * Optional slot for custom navigation buttons
   * @description Receives navigation functions as props
   */
  navigation(props: {
    prevSlide: (behavior?: ScrollBehavior) => void;
    nextSlide: (behavior?: ScrollBehavior) => void;
    toSlide: (slideNumber: number, behavior?: ScrollBehavior) => void;
    isFirstSlide: boolean;
    isLastSlide: boolean;
    slideCount: number;
    activeSlide: number;
  }): any;
}>();

// Reactive state
const activeSlide = ref(0);
const slidesContainerEl = ref<HTMLElement | null>(null);
const slideEls = ref<HTMLElement[]>([]) as Ref<HTMLElement[]>;

// Computed properties
const slideCount = computed(() => slideEls.value.length);
const isFirstSlide = computed(() => activeSlide.value === 0);
const isLastSlide = computed(() => activeSlide.value === slideCount.value - 1);

/**
 * Called when the stepper changes
 */
const onStepperChange = (stepIndex: number) => {
  toSlide(stepIndex);
};

/**
 * Go to a specific slide
 * @param slideNumber The slide number to go to
 * @param behavior The scroll behavior to use
 */
const toSlide = (slideNumber: number, behavior: ScrollBehavior = 'smooth') => {
  if (props.disabled) return;

  // Get the slide element
  const slideEl = slideEls.value[slideNumber] as HTMLElement;

  // Validate inputs
  if (slideNumber < 0 || slideNumber >= slideCount.value) {
    throw new Error(`slideNumber ${slideNumber} is out of bounds!`);
  }
  if (!slidesContainerEl.value) throw new Error('slidesContainerEl is null!');
  if (!slideEl)
    throw new Error(`slide element with index ${slideNumber} not found!`);

  // Scroll to the slide
  slideEl.scrollIntoView({ behavior, block: 'center' });

  // Only emit the event if the slide actually changed
  if (slideNumber === activeSlide.value) return;

  const oldSlideNumber = activeSlide.value;

  // Finish up
  activeSlide.value = slideNumber;
  emit('slide', {
    slideNumber,
    oldSlideNumber,
    slideEl,
  });
};

/**
 * Go to the previous slide
 * @param behavior The scroll behavior to use
 */
const prevSlide = (behavior?: ScrollBehavior) => {
  if (props.disabled) return;

  let prevIndex = activeSlide.value - 1;
  // If we're at the beginning, go to the end
  if (prevIndex < 0) {
    if (!props.infinite) return; // If we're not infinite, don't do anything
    prevIndex = slideCount.value - 1;
  }
  toSlide(prevIndex, behavior);
};

/**
 * Go to the next slide
 * @param behavior The scroll behavior to use
 */
const nextSlide = (behavior?: ScrollBehavior) => {
  if (props.disabled) return;

  let nextIndex = activeSlide.value + 1;
  // If we're at the end, go back to the beginning
  if (nextIndex >= slideCount.value) {
    if (!props.infinite) return; // If we're not infinite, don't do anything
    nextIndex = 0;
  }
  toSlide(nextIndex, behavior);
};

/**
 * Handle window resize events
 */
const handleResize = () => {
  // If the user resizes the window, we want to make sure the active slide is still centered
  toSlide(activeSlide.value, 'auto');
};

/**
 * Handle keyboard navigation
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled || props.disableKeyboardNavigation) return;

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      prevSlide();
      break;
    case 'ArrowRight':
      event.preventDefault();
      nextSlide();
      break;
    case 'Home':
      event.preventDefault();
      toSlide(0);
      break;
    case 'End':
      event.preventDefault();
      toSlide(slideCount.value - 1);
      break;
    default:
      // Allow default behavior for other keys
      break;
  }
};

onMounted(() => {
  slideEls.value = Array.from(
    slidesContainerEl.value?.children || []
  ) as HTMLElement[];
  window.addEventListener('resize', handleResize, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// Expose methods for external use
defineExpose({
  prevSlide,
  nextSlide,
  toSlide,
  isFirstSlide,
  isLastSlide,
  slideCount,
  activeSlide,
});
</script>
