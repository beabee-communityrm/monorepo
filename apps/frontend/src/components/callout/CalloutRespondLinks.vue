<!--
  # CalloutRespondLinks
  The respond links for a CrowdNewsroom in a list: "Participate" until the
  member has responded, then a note that they have, with a link to update or
  respond again where the response mode allows it.

  Placement and framing are the caller's. `compact` puts a shorter note and
  the link on one line, for a narrow column.
-->
<template>
  <div
    class="flex font-medium text-primary"
    :class="
      compact ? 'flex-wrap items-center gap-x-1.5 gap-y-1' : 'flex-col gap-1'
    "
  >
    <RouterLink
      v-if="!callout.hasAnswered"
      :to="respondUrl"
      class="group/respond relative z-10 inline-flex items-center gap-1 self-start hover:underline"
    >
      {{ t('actions.participate') }}
      <UIcon
        name="i-lucide-chevron-right"
        class="size-4 transition-transform group-hover/respond:translate-x-0.5"
        aria-hidden="true"
      />
    </RouterLink>

    <template v-else>
      <div class="flex items-center gap-1.5">
        <UIcon
          name="i-lucide-check"
          class="size-3 shrink-0"
          aria-hidden="true"
        />
        {{ t(compact ? 'callout.replied' : 'callout.youResponded') }}
      </div>
      <span v-if="compact && respondAgainKey" aria-hidden="true">·</span>
      <RouterLink
        v-if="respondAgainKey"
        :to="respondUrl"
        class="group/respond relative z-10 inline-flex items-center gap-1.5 self-start hover:underline"
      >
        <span v-if="!compact" class="size-3 shrink-0" />
        <span class="flex items-center gap-1">
          {{ t(respondAgainKey) }}
          <UIcon
            name="i-lucide-chevron-right"
            class="size-4 transition-transform group-hover/respond:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </RouterLink>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { CalloutResponseMode } from '@beabee/beabee-common';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import type { CalloutCardData } from '#type';

const props = defineProps<{
  /** The CrowdNewsroom to respond to */
  callout: CalloutCardData;
  /** Puts a shorter note and the link on one line */
  compact?: boolean;
}>();

const { t } = useI18n();

const respondUrl = computed(
  () => `/crowdnewsroom/${props.callout.slug}/respond`
);

const respondAgainKey = computed(() => {
  switch (props.callout.responseMode) {
    case CalloutResponseMode.SingleEditable:
      return 'callout.actions.updateResponse';
    case CalloutResponseMode.Multiple:
      return 'callout.actions.participateAgain';
  }
  return null;
});
</script>
