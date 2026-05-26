<!--
  # AppCategoryLabel
  A small uppercase label component for categorizing and grouping content.

  ## Features:
  - Small uppercase text for visual distinction
  - Wide letter spacing for readability
  - Consistent bottom margin for content separation
  - Semantic paragraph element (not a heading)

  ## Usage:
  ```vue
  <AppCategoryLabel>Category Name</AppCategoryLabel>
  ```
-->
<template>
  <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-body-80">
    <slot />
  </p>
</template>

<script lang="ts" setup>
/**
 * Small uppercase label component for categorizing content sections.
 * Used for group headers in dropdowns, menus, and list sections.
 *
 * @component AppCategoryLabel
 */
</script>
