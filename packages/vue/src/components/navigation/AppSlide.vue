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
 * Simple slide component for use within AppSlider
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
</script>
