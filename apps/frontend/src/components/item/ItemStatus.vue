<!--
  # ItemStatus
  A component for displaying item status with color-coded styling and optional circle indicator.
  Shows status text in various predefined color schemes using internal i18n.

  Uses internal i18n for status text:
  - Draft: common.status.draft
  - Scheduled: common.status.scheduled
  - Open: common.status.open
  - Ended: common.status.ended
-->
<template>
  <span class="text-sm font-bold uppercase" :class="colorClasses[props.status]">
    <span
      v-if="props.circle"
      class="-mt-px mr-1 inline-block h-3 w-3 rounded-full bg-[currentColor] align-middle"
      :aria-hidden="true"
    />
    {{ t(`common.status.${props.status}`) }}
  </span>
</template>

<script lang="ts" setup>
/**
 * Status display component with color-coded styling for different item states.
 * Supports optional circle indicator and uses internal i18n for status text.
 *
 * Uses internal i18n for status text mapping:
 * - Draft: common.status.draft
 * - Scheduled: common.status.scheduled
 * - Open: common.status.open
 * - Ended: common.status.ended
 *
 * @component ItemStatus
 *
 * @example
 * <ItemStatus status="open" :circle="true" />
 */
import { ItemStatus } from '@beabee/beabee-common';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();

/**
 * Props for the ItemStatus component
 */
export interface ItemStatusProps {
  /** Current status of the item */
  status: ItemStatus;
  /** Whether to show a colored circle indicator before the text */
  circle?: boolean;
}

const props = withDefaults(defineProps<ItemStatusProps>(), {
  circle: false,
});

/**
 * Color classes for different item statuses
 */
const colorClasses = {
  [ItemStatus.Draft]: 'text-body-60',
  [ItemStatus.Scheduled]: 'text-warning',
  [ItemStatus.Open]: 'text-success',
  [ItemStatus.Ended]: 'text-body-80',
} as const;
</script>
