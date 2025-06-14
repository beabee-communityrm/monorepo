<!--
  # AppTitle
  A semantic H1 title component with flexible styling options and responsive design.

  ## Features:
  - Semantic H1 element for proper document structure
  - Responsive font sizing (optional big variant)
  - Configurable font weight (light or semibold)
  - Optional margin removal for custom layouts
  - Tight line height for better text flow

  ## Usage:
  ```vue
  <AppTitle>Page Title</AppTitle>
  <AppTitle big light>Hero Title</AppTitle>
  <AppTitle no-margin>Inline Title</AppTitle>
  ```
-->
<template>
  <h1
    class="font-title text-3.5xl/tight"
    :class="[
      big && 'md:text-5xl/tight',
      light ? 'font-light' : 'font-semibold',
      !noMargin && 'mb-3',
    ]"
  >
    <slot />
  </h1>
</template>

<script lang="ts" setup>
/**
 * Semantic H1 title component with flexible styling options
 *
 * @component AppTitle
 */

/**
 * Props for the AppTitle component
 */
export interface AppTitleProps {
  /** Whether to use the larger responsive font size */
  big?: boolean;
  /** Whether to use light font weight instead of semibold */
  light?: boolean;
  /** Whether to remove the default bottom margin */
  noMargin?: boolean;
}

withDefaults(defineProps<AppTitleProps>(), {
  big: false,
  light: false,
  noMargin: false,
});

/**
 * Slots available in the AppTitle component
 */
defineSlots<{
  /**
   * Title content
   * @description The text or other content for the main title
   */
  default(): any;
}>();
</script>
