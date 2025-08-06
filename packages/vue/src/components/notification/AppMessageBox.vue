<template>
  <div class="flex items-center gap-4 rounded bg-white p-6">
    <div class="flex-0 self-start text-2xl" :class="textColor">
      <font-awesome-icon :icon="icon" />
    </div>
    <div class="flex-1">
      <AppSubHeading :class="textColor">
        {{ title }}
      </AppSubHeading>
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';

import { AppSubHeading } from '../typography';

/**
 * Message box component for displaying informational messages
 *
 * @example
 * ```vue
 * <AppMessageBox
 *   title="Success"
 *   :icon="faCheck"
 *   variant="success"
 * >
 *   <p>Your action was completed successfully!</p>
 * </AppMessageBox>
 * ```
 */

const props = defineProps<{
  /** Title text for the message */
  title: string;
  /** Icon to display */
  icon: IconDefinition;
  /** Visual variant of the message */
  variant: 'success' | 'info';
}>();

const textColor = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'text-success';
    case 'info':
      return 'text-body-80';
    default:
      return '';
  }
});
</script>
