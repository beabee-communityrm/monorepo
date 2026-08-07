<template>
  <UCard
    class="@container"
    :ui="{
      body: 'flex flex-col gap-3 @xl:flex-row @xl:flex-wrap @xl:items-center @xl:justify-between @xl:gap-4',
    }"
  >
    <h2 class="@xl:hidden">{{ t('callout.about.title') }}</h2>

    <div
      class="flex flex-col gap-2 @xl:flex-row @xl:flex-wrap @xl:items-center @xl:gap-6"
    >
      <div
        v-for="fact in facts"
        :key="fact.icon"
        class="flex items-center gap-2"
      >
        <UIcon :name="fact.icon" class="text-muted size-4 shrink-0" />
        <span>{{ fact.text }}</span>
      </div>
    </div>

    <USeparator class="@xl:hidden" />

    <CalloutSharePopover :url="shareUrl" />
  </UCard>
</template>

<script lang="ts" setup>
import { type CalloutAccess } from '@beabee/beabee-common';
import { formatLocale } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { getCalloutAccessInfo } from '#utils/callout-access';

import CalloutSharePopover from './CalloutSharePopover.vue';

const { t } = useI18n();

/** Props for CalloutAboutCard */
export interface CalloutAboutCardProps {
  /** When the CrowdNewsroom starts */
  starts: Date;
  /** When the CrowdNewsroom expires, if it has an end date */
  expires?: Date;
  /** Total number of responses so far, omitted if the viewer isn't allowed to see it */
  responseCount?: number;
  /** Who can access and respond to the CrowdNewsroom */
  access: CalloutAccess;
  /** The full URL to share */
  shareUrl: string;
}

const props = defineProps<CalloutAboutCardProps>();

const access = computed(() => getCalloutAccessInfo(props.access));

const facts = computed(() => [
  {
    icon: 'i-lucide-calendar',
    text: props.expires
      ? `${formatLocale(props.starts, 'd MMM yyyy')} – ${formatLocale(props.expires, 'd MMM yyyy')}`
      : formatLocale(props.starts, 'd MMM yyyy'),
  },
  ...(props.responseCount !== undefined
    ? [
        {
          icon: 'i-lucide-users',
          text: t(
            'callout.about.responses',
            { n: props.responseCount },
            props.responseCount
          ),
        },
      ]
    : []),
  {
    icon: access.value.icon,
    text: t(access.value.labelKey),
  },
]);
</script>
