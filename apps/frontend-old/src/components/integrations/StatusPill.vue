<template>
  <span
    class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium"
    :class="config[type].classes"
  >
    <AppRoundBadge :type="type" size="small" />
    <slot />
  </span>
</template>

<script lang="ts" setup>
import { AppRoundBadge } from '@beabee/vue';

type PillType = 'success' | 'disabled' | 'danger';

defineProps<{ type: PillType }>();

const config: Record<PillType, { classes: string }> = {
  success: { classes: 'border-success text-success' },
  danger: { classes: 'border-danger text-danger' },
  disabled: { classes: 'border-grey-dark text-grey-dark' },
};
</script>
