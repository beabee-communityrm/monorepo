<!--
  # AppSlider
  A slider component that allows you to slide between elements. Useful for things like modals with multiple steps or a carousel.

  ## Props
  - `infinite` (boolean): Whether or not to allow infinite scrolling. Defaults to `false`.
  - 'steps' (AppStepperStep[](Optional)): The steps to display in the stepper. Defaults to `[]`. If no steps are provided, no stepper will not be displayed.

  ## Events
  - `slide` (details: AppSliderSlideEventDetails): Emitted when a slide is scrolled to. `details` contains the slide number and the slide element.

  ## Slots
  - `slides` (Required): The slides to display in the slider.
  - `navigation` (Optional): The navigation buttons to display. Receives the `prevSlide`, `nextSlide`, and `toSlide` functions as props.

  ## Note
  - To get the slide animation working on Safari you need a polyfill for `scroll-behavior: smooth`. I recommend [smoothscroll-polyfill](https://github.com/iamdustan/smoothscroll)

  ## Possible improvements
  - Add support for touch (scrolling by swiping)
  - Add support for keyboard navigation
  - Add support for indicators

-->

<template>
  <AppStepper
    v-if="steps && steps.length > 0"
    v-model="activeSlide"
    class="justify-center"
    :steps="steps"
    @update:model-value="onStepperChange"
  />
  <div
    ref="slidesContainerEl"
    class="flex w-full flex-nowrap overflow-x-hidden whitespace-nowrap"
  >
    <slot name="slides"></slot>
  </div>
  <slot
    name="navigation"
    :prev-slide="prevSlide"
    :next-slide="nextSlide"
    :to-slide="toSlide"
    :is-first-slide="isFirstSlide"
    :is-last-slide="isLastSlide"
    :slide-count="slideCount"
    :active-slide="activeSlide"
  ></slot>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

import AppStepper from '../stepper/AppStepper.vue';

import type { AppSliderProps } from '@type/app-slider-props';
import type { AppSliderSlideEventDetails } from '@type/app-slider-slide-event-details';

const emit = defineEmits<{
  (e: 'slide', details: AppSliderSlideEventDetails): void;
}>();

const props = withDefaults(defineProps<AppSliderProps>(), {
  infinite: false,
});

const activeSlide = ref(0);
const slideCount = computed(() => slideEls.value.length);
const isFirstSlide = computed(() => activeSlide.value === 0);
const isLastSlide = computed(() => activeSlide.value === slideCount.value - 1);
const slidesContainerEl = ref<HTMLElement | null>(null);
const slideEls = ref<HTMLElement[]>([]);

/** Called when the stepper changes */
const onStepperChange = (stepIndex: number) => {
  toSlide(stepIndex);
};

/**
 * Go to a specific slide
 * @param slideNumber The slide number to go to
 * @param behavior The scroll behavior to use
 */
const toSlide = (slideNumber: number, behavior: ScrollBehavior = 'smooth') => {
  // Get the slide element
  const slideEl = slideEls.value[slideNumber];

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

onMounted(() => {
  slideEls.value = Array.from(
    slidesContainerEl.value?.children || []
  ) as HTMLElement[];
  window.addEventListener('resize', handleResize, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

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
