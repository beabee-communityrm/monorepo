<template>
  <AppButton
    variant="primaryOutlined"
    class="lg:justify-start"
    :icon="icon"
    :aria-label="ariaLabel || title"
    :title="title"
  >
    <span v-if="ariaLabel && !$slots.default" class="sr-only">{{
      ariaLabel
    }}</span>
    <slot></slot>
  </AppButton>
</template>

<script lang="ts" setup>
/**
 * An action button component that extends AppButton with specific styling
 * and accessibility features.
 *
 * @component ActionButton
 *
 * @example
 * <ActionButton
 *   :icon="faEdit"
 *   aria-label="Edit profile"
 *   title="Edit"
 * >
 *   Edit
 * </ActionButton>
 */

import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import AppButton from './AppButton.vue';

interface Props {
  /** Icon to display in the button */
  icon: IconDefinition;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Tooltip text */
  title?: string;
}

withDefaults(defineProps<Props>(), {
  ariaLabel: undefined,
  title: undefined,
});
</script>
