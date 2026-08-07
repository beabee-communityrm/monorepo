<template>
  <UCard
    class="@container"
    :ui="{
      root: isActionable ? 'ring-primary/30' : undefined,
      body: 'flex flex-col gap-3 @xl:flex-row @xl:items-center @xl:justify-between @xl:gap-4',
    }"
  >
    <div class="flex flex-col gap-1">
      <div class="flex items-center gap-2">
        <UIcon
          v-if="hasResponded && canUpdate"
          name="i-lucide-circle-check"
          class="text-primary size-4"
        />
        <h2>{{ t('callout.yourResponse') }}</h2>
      </div>

      <p v-if="!hasResponded" class="text-muted">
        {{ t('callout.responseCard.notResponded') }}
      </p>
      <p v-else class="text-muted">
        {{
          t('callout.responseCard.submitted', {
            date: formatLocale(submittedAt!, 'PPP'),
          })
        }}
      </p>
    </div>

    <UButton
      class="w-full @xl:w-auto"
      :color="hasResponded && !canUpdate ? 'neutral' : 'primary'"
      :variant="hasResponded && !canUpdate ? 'outline' : 'solid'"
      :to="respondTo"
    >
      {{ actionLabel }}
    </UButton>
  </UCard>
</template>

<script lang="ts" setup>
import { formatLocale } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RouteLocationRaw } from 'vue-router';

const { t } = useI18n();

/** Props for CalloutResponseCard */
export interface CalloutResponseCardProps {
  /** Link to the respond page */
  respondTo: RouteLocationRaw;
  /** Whether the current user has already submitted a response */
  hasResponded: boolean;
  /** Whether the current user can still submit/update a response */
  canUpdate: boolean;
  /** When the user's latest response was submitted, required if hasResponded is true */
  submittedAt?: Date;
}

const props = defineProps<CalloutResponseCardProps>();

const isActionable = computed(() => !props.hasResponded || props.canUpdate);

const actionLabel = computed(() => {
  if (!props.hasResponded) return t('actions.getStarted');
  if (props.canUpdate) return t('callout.actions.updateResponse');
  return t('callout.responseCard.viewAnswers');
});
</script>
