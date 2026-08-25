<template>
  <RouterLink
    :to="`/crowdnewsroom/${callout.slug}`"
    class="group hover:bg-elevated flex items-center gap-4 p-3 transition-colors"
  >
    <div class="min-w-0 flex-1">
      <p class="text-highlighted truncate font-medium">
        {{ callout.title }}
      </p>
      <div class="text-muted mt-0.5 flex flex-wrap items-center gap-3">
        <span v-if="callout.expires">
          {{ t('common.status.ended') }}
          {{ formatLocale(callout.expires, 'd MMM yyyy') }}
        </span>
        <span
          v-if="callout.responseCount !== undefined"
          class="flex items-center gap-1"
        >
          <UIcon name="i-lucide-users" class="size-3" />
          <i18n-t
            keypath="callouts.data.responses"
            :plural="callout.responseCount"
          >
            <template #n>{{ callout.responseCount }}</template>
          </i18n-t>
        </span>
        <span class="flex items-center gap-1">
          <UIcon :name="access.icon" class="size-3" />
          {{ t(access.labelKey) }}
        </span>
        <span
          v-if="callout.responseViewSchema?.gallery"
          class="flex items-center gap-1"
        >
          <UIcon name="i-lucide-image" class="size-3" />
          {{ t('callout.views.gallery') }}
        </span>
      </div>
    </div>

    <UBadge
      v-if="callout.hasAnswered"
      color="success"
      variant="subtle"
      class="shrink-0"
    >
      <UIcon name="i-lucide-check" class="size-3" />
      {{ t('callouts.showAnswered') }}
    </UBadge>

    <UIcon
      name="i-lucide-chevron-right"
      class="text-dimmed size-4 shrink-0"
    />
  </RouterLink>
</template>

<script lang="ts" setup>
import { formatLocale } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import { getCalloutAccessInfo } from '#utils/callout-access';
import type { CalloutCardData } from '#type';

const props = defineProps<{
  callout: CalloutCardData;
}>();

const { t } = useI18n();

const access = computed(() => getCalloutAccessInfo(props.callout.access));
</script>
