<template>
  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
    <span v-if="daysLeft !== null" class="flex items-center gap-1">
      <UIcon
        name="i-lucide-clock"
        class="size-3.5 shrink-0"
        aria-hidden="true"
      />
      <i18n-t keypath="callouts.daysLeft" :plural="daysLeft">
        <template #n>{{ daysLeft }}</template>
      </i18n-t>
    </span>
    <span v-if="showEndDate && callout.expires">
      {{ t('common.status.ended') }}
      {{ formatLocale(callout.expires, 'd MMM yyyy') }}
    </span>
    <span class="flex items-center gap-1">
      <UIcon :name="access.icon" class="size-3.5 shrink-0" aria-hidden="true" />
      {{ t(access.labelKey) }}
    </span>
    <span
      v-if="callout.responseCount !== undefined"
      class="flex items-center gap-1"
    >
      <UIcon
        name="i-lucide-users"
        class="size-3.5 shrink-0"
        aria-hidden="true"
      />
      <i18n-t keypath="callouts.data.responses" :plural="callout.responseCount">
        <template #n>{{ callout.responseCount }}</template>
      </i18n-t>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { CalloutAccess } from '@beabee/beabee-common';
import { formatLocale } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { getDaysLeft } from '#utils/callouts';
import type { CalloutCardData } from '#type';

const props = defineProps<{
  callout: CalloutCardData;
  showEndDate?: boolean;
}>();

const { t } = useI18n();

const daysLeft = computed(() => getDaysLeft(props.callout.expires));

const access = computed(() =>
  props.callout.access === CalloutAccess.Member
    ? { icon: 'i-lucide-lock', labelKey: 'callouts.access.member' }
    : { icon: 'i-lucide-globe', labelKey: 'callouts.access.everyone' }
);
</script>
