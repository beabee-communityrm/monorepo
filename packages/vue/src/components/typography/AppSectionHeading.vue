<!--
  # AppSectionHeading
  A semantic H4 section heading component for organizing content subsections.

  ## Features:
  - Semantic H4 element for proper document structure
  - Medium font weight for visual hierarchy
  - Consistent font sizing and spacing
  - Body text color for subtle differentiation

  ## Usage:
  ```vue
  <AppSectionHeading>Section Title</AppSectionHeading>
  ```
-->
<template>
  <h4 class="font-regular mb-3 font-title text-xl text-body">
    <slot />
  </h4>
</template>

<script lang="ts" setup>
/**
 * Semantic H4 section heading component for content subsections
 *
 * @component AppSectionHeading
 */

/**
 * Slots available in the AppSectionHeading component
 */
defineSlots<{
  /**
   * Section heading content
   * @description The text or other content for the section heading
   */
  default(): any;
}>();
</script>
