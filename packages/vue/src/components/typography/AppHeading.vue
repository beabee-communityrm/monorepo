<!--
  # AppHeading
  A semantic H2 heading component with consistent typography and spacing.

  ## Features:
  - Semantic H2 element for proper document structure
  - Consistent font sizing and weight
  - Built-in margin bottom for content spacing
  - Slot-based content for flexibility

  ## Usage:
  ```vue
  <AppHeading>Section Title</AppHeading>
  ```
-->
<template>
  <h2 class="mb-3 font-title text-2.2xl/tight font-semibold text-body-60">
    <slot />
  </h2>
</template>

<script lang="ts" setup>
/**
 * Simple heading component that renders an h2 element with consistent styling
 *
 * @component AppHeading
 */
</script>
