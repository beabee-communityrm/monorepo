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
 * Simple section heading component that renders an h3 element with consistent styling
 *
 * @component AppSectionHeading
 */
</script>
