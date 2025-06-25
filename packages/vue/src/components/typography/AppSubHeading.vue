<!--
  # AppSubHeading
  A semantic H3 subheading component with consistent typography and responsive spacing.

  ## Features:
  - Semantic H3 element for proper document structure
  - Responsive bottom margin (removed on last child)
  - Consistent font sizing and weight
  - Tight line height for better text flow

  ## Usage:
  ```vue
  <AppSubHeading>Subsection Title</AppSubHeading>
  ```
-->
<template>
  <h3
    class="mb-3 font-title text-1.8xl/tight font-semibold text-body-60 last:mb-0"
  >
    <slot />
  </h3>
</template>

<script lang="ts" setup>
/**
 * Semantic H3 subheading component with consistent typography
 *
 * @component AppSubHeading
 */

/**
 * Slots available in the AppSubHeading component
 */
defineSlots<{
  /**
   * Subheading content
   * @description The text or other content for the subheading
   */
  default(): any;
}>();
</script>
