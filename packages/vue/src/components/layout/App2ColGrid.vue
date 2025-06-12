<!--
  # App2ColGrid
  A responsive two-column grid layout component that adapts from single column on mobile 
  to two columns on larger screens with configurable column spans.

  ## Features:
  - Responsive design: Single column on mobile, two columns on medium+ screens
  - Configurable extended layout for wider second column
  - Slot-based content with conditional rendering
  - Built with CSS Grid and Tailwind responsive utilities

  ## Usage:
  ```vue
  <App2ColGrid>
    <template #col1>
      Content for first column
    </template>
    <template #col2>
      Content for second column (optional)
    </template>
  </App2ColGrid>
  ```
-->
<template>
  <div class="grid max-w-[1400px] grid-cols-12 gap-6">
    <!-- First Column -->
    <div class="col-span-12 md:col-span-6 xl:col-span-4">
      <slot name="col1" />
    </div>

    <!-- Second Column (conditional) -->
    <div
      v-if="$slots.col2"
      class="col-span-12 md:col-span-6 xl:col-start-6"
      :class="extended ? 'xl:col-end-13' : 'xl:col-end-10'"
    >
      <slot name="col2" />
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * Two-column responsive grid layout component
 *
 * @component App2ColGrid
 */

/**
 * Props for the App2ColGrid component
 */
export interface App2ColGridProps {
  /** Whether the second column should extend to the full width */
  extended?: boolean;
}

withDefaults(defineProps<App2ColGridProps>(), {
  extended: false,
});

/**
 * Slots available in the App2ColGrid component
 */
defineSlots<{
  /**
   * Content for the first column
   * @description Always visible column that takes 4/12 columns on xl+ screens
   */
  col1(): any;
  /**
   * Content for the second column (optional)
   * @description Second column that can be extended based on the extended prop
   */
  col2(): any;
}>();
</script>
