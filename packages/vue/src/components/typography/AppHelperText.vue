<!--
  # AppHelperText
  A small helper text component for descriptions, captions, and secondary information.

  ## Features:
  - Consistent small text styling (text-xs)
  - Subtle color for visual hierarchy (text-body-80)
  - Semantic paragraph element
  - Slot-based content for flexibility

  ## Usage:
  ```vue
  <AppHelperText>Additional information about the field</AppHelperText>
  ```
-->
<template>
  <p class="text-xs text-body-80">
    <slot />
  </p>
</template>

<script lang="ts" setup>
/**
 * Small helper text component for descriptions and secondary information.
 * Provides consistent styling for captions, hints, and supplementary text.
 *
 * @component AppHelperText
 */
</script>
