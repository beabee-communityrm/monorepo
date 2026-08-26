<template>
  <div class="text-muted flex flex-wrap items-center gap-x-3 gap-y-1">
    <slot />
    <span class="flex items-center gap-1">
      <UIcon :name="access.icon" class="size-3.5 shrink-0" />
      {{ t(access.labelKey) }}
    </span>
    <span
      v-if="callout.responseCount !== undefined"
      class="flex items-center gap-1"
    >
      <UIcon name="i-lucide-users" class="size-3.5 shrink-0" />
      <i18n-t keypath="callouts.data.responses" :plural="callout.responseCount">
        <template #n>{{ callout.responseCount }}</template>
      </i18n-t>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { CalloutAccess } from '@beabee/beabee-common';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CalloutCardData } from '#type';

const props = defineProps<{
  callout: CalloutCardData;
}>();

const { t } = useI18n();

const access = computed(() =>
  props.callout.access === CalloutAccess.Member
    ? { icon: 'i-lucide-lock', labelKey: 'callouts.access.member' }
    : { icon: 'i-lucide-globe', labelKey: 'callouts.access.everyone' }
);
</script>
