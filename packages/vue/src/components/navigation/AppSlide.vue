<!--
  # AppSlide
  A single slide wrapper component for use within AppSlider.
  Provides consistent styling and layout for slider content.

  ## Usage
  Used as a container for slide content within AppSlider components.
  Each slide takes the full width and height of the slider container.
-->
<template>
  <div
    class="w-full flex-none"
    role="group"
    :aria-label="ariaLabel"
    :aria-roledescription="ariaRoleDescription"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
/**
 * Slide container component for AppSlider.
 * Provides a wrapper for individual slide content with proper styling and accessibility.
 *
 * @component AppSlide
 */

/**
 * Props for the AppSlide component
 */
export interface AppSlideProps {
  /** Accessible label for the slide */
  ariaLabel?: string;
  /** ARIA role description for the slide */
  ariaRoleDescription?: string;
}

const props = withDefaults(defineProps<AppSlideProps>(), {
  ariaLabel: undefined,
  ariaRoleDescription: 'slide',
});

/**
 * Slots available in the AppSlide component
 */
defineSlots<{
  /**
   * Default slot for slide content
   * @description Place any content for the slide here
   */
  default(): any;
}>();
</script>
