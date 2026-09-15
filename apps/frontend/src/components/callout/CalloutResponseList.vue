<!--
  # CalloutResponseList
  The current user's responses to a CrowdNewsroom, with a heading and whichever
  action is open to them. A single response is labelled here rather than in its
  card, so the date and the edit action sit alongside the heading.
-->
<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3">
      <div class="flex flex-wrap items-baseline gap-x-3">
        <h3 class="text-lg">{{ heading }}</h3>
        <p v-if="submittedAt" class="text-muted">
          {{
            t('callout.submittedOn', { date: formatLocale(submittedAt, 'PPP') })
          }}
        </p>
      </div>

      <UButton v-if="addTo" icon="i-lucide-plus" :to="addTo">
        {{ t('callout.addAnotherResponse') }}
      </UButton>
      <UButton
        v-else-if="editTo"
        color="neutral"
        variant="outline"
        :to="editTo"
      >
        {{ t('callout.editResponse') }}
      </UButton>
    </div>

    <CalloutResponseCard
      v-for="item in items"
      :key="item.response.id"
      :form-schema="formSchema"
      :answers="item.response.answers"
      :submitted-at="item.response.createdAt"
      :heading="item.heading"
    />
  </div>
</template>

<script lang="ts" setup>
import type {
  GetCalloutFormSchema,
  GetCalloutResponseDataWith,
  GetCalloutResponseWith,
} from '@beabee/beabee-common';
import { formatLocale } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RouteLocationRaw } from 'vue-router';

import CalloutResponseCard from '#components/callout/CalloutResponseCard.vue';

/** Props for CalloutResponseList */
export interface CalloutResponseListProps {
  /** The form the responses were submitted to */
  formSchema: GetCalloutFormSchema;
  /** The current user's responses, newest first */
  responses: GetCalloutResponseDataWith<GetCalloutResponseWith.Answers>[];
  /** Where adding another response goes, if more are allowed */
  addTo?: RouteLocationRaw;
  /** Where editing goes, if the one response can still be edited */
  editTo?: RouteLocationRaw;
}

const props = defineProps<CalloutResponseListProps>();

const { t } = useI18n();

const heading = computed(() =>
  props.responses.length > 1
    ? t('callout.yourResponses', { count: props.responses.length })
    : t('callout.yourResponse')
);

/** Only shown here when there's one response; otherwise each card carries it */
const submittedAt = computed(() =>
  props.responses.length === 1 ? props.responses[0].createdAt : undefined
);

// Numbered from the oldest, so the numbers hold when another is added
const items = computed(() =>
  props.responses.map((response, i) => ({
    response,
    heading:
      props.responses.length > 1
        ? t('callout.responseNumber', { number: props.responses.length - i })
        : undefined,
  }))
);
</script>
