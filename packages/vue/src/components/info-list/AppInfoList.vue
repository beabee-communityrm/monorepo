<!--
  # AppInfoList
  A semantic definition list container for displaying structured information.

  ## Features:
  - Semantic HTML dl element for accessibility
  - Flexbox layout with wrapping and gap spacing
  - Container for AppInfoListItem components
  - Clean, minimal styling

  ## Usage:
  ```vue
  <AppInfoList>
    <AppInfoListItem name="Status" value="Active" />
    <AppInfoListItem name="Members">{{ memberCount }}</AppInfoListItem>
  </AppInfoList>
  ```
-->
<template>
  <dl class="flex flex-wrap gap-4">
    <slot />
  </dl>
</template>

<script lang="ts" setup>
/**
 * Semantic definition list container for structured information display
 *
 * @component AppInfoList
 */

/**
 * Slots available in the AppInfoList component
 */
defineSlots<{
  /**
   * Definition list items
   * @description Typically contains AppInfoListItem components or other dt/dd pairs
   */
  default(): any;
}>();
</script>
