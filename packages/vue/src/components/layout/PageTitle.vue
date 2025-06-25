<template>
  <div
    class="flex items-center justify-between"
    :class="{ 'mb-5 border-b border-primary-40': border }"
  >
    <AppTitle
      light
      class="mr-4 text-primary-80"
      :class="{ 'hidden md:block': !noCollapse }"
    >
      {{ title }}
    </AppTitle>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { AppTitle } from '../typography';

/**
 * Page title component with optional border and collapsible behavior
 *
 * @example
 * ```vue
 * <PageTitle
 *   title="Dashboard"
 *   :border="true"
 *   :no-collapse="false"
 * >
 *   <AppButton>Action</AppButton>
 * </PageTitle>
 * ```
 */

defineProps<{
  /** Title text to display */
  title: string;
  /** Whether to show bottom border */
  border?: boolean;
  /** Whether to prevent title collapse on mobile */
  noCollapse?: boolean;
}>();
</script>
