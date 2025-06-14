<template>
  <div class="mb-2 flex gap-2">
    <slot name="before"></slot>
    <AppButton
      variant="primaryOutlined"
      size="sm"
      :icon="buttonIcon"
      :class="
        expanded ? 'relative rounded-b-none hover:bg-white' : 'bg-white/0'
      "
      @click="expanded = !expanded"
    >
      {{ buttonText }}
      <font-awesome-icon :icon="expanded ? faCaretUp : faCaretDown" />
      <div
        v-show="expanded"
        class="absolute -left-px top-full box-content h-2 w-full border-x border-x-primary-40 bg-white py-px"
      />
    </AppButton>
  </div>

  <div v-if="expanded" class="rounded border border-primary-40 bg-white p-4">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';

import { AppButton } from '../button';

/**
 * Expandable box component with toggle functionality
 *
 * @example
 * ```vue
 * <AppExpandableBox
 *   :button-icon="faShare"
 *   button-text="Share"
 * >
 *   <p>Content goes here</p>
 * </AppExpandableBox>
 * ```
 */

defineProps<{
  /** Icon to display on the toggle button */
  buttonIcon: IconDefinition;
  /** Text to display on the toggle button */
  buttonText: string;
}>();

const expanded = defineModel<boolean>('expanded');
</script>
