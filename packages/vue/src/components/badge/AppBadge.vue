<!--
  # AppBadge
  A simple inline badge component for displaying labels, counts, or status indicators.

  ## Features:
  - Consistent styling with rounded corners and padding
  - Link color theming for brand consistency
  - Slot-based content for flexibility
  - Semantic span element

  ## Usage:
  ```vue
  <AppBadge>New</AppBadge>
  <AppBadge>{{ count }}</AppBadge>
  ```
-->
<template>
  <span
    class="flex h-7.5 items-center rounded bg-white px-2 text-xs font-semibold text-link"
  >
    <slot />
  </span>
</template>

<script lang="ts" setup>
/**
 * Inline badge component for displaying labels, counts, or status indicators
 *
 * @component AppBadge
 */
</script>
