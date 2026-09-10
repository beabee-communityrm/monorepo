<!--
  # CalloutResponseCard
  A submitted response, shown back to the contributor as a list of questions
  and their answers. Read-only — editing goes through CalloutForm on /respond.

  The header is only rendered when a heading is passed. A single response is
  labelled above the card by the page, so it comes through headerless; several
  responses each carry their own "Response n" header.
-->
<template>
  <UCard
    :title="heading"
    :description="
      heading
        ? t('callout.submittedOn', { date: formatLocale(submittedAt, 'PPP') })
        : undefined
    "
    :ui="{
      body: 'p-0 sm:p-0',
    }"
  >
    <dl class="divide-y divide-muted/50">
      <div
        v-for="row in rows"
        :key="row.key"
        class="flex flex-col gap-1 px-4 py-4 sm:px-6"
      >
        <dt class="font-medium text-highlighted">{{ row.label }}</dt>

        <dd v-if="row.images" class="flex flex-wrap gap-2">
          <img
            v-for="(src, i) in row.images"
            :key="i"
            class="max-h-40 rounded bg-white p-1 ring ring-default"
            :src="src"
            :alt="row.imageAlt || ''"
          />
        </dd>

        <dd v-else-if="row.href" class="flex flex-wrap items-center gap-x-3">
          <span v-if="row.value" class="wrap-break-word text-muted">
            {{ row.value }}
          </span>
          <UButton
            variant="link"
            class="p-0"
            :to="row.href"
            target="_blank"
            rel="noopener"
          >
            {{ t('callout.viewFile') }}
          </UButton>
        </dd>

        <dd v-else-if="row.value === null" class="text-dimmed">
          {{ t('callout.notAnswered') }}
        </dd>

        <dd v-else class="wrap-break-word whitespace-pre-line text-muted">
          {{ row.value }}
        </dd>
      </div>
    </dl>
  </UCard>
</template>

<script lang="ts" setup>
import type {
  CalloutResponseAnswersSlide,
  GetCalloutFormSchema,
} from '@beabee/beabee-common';
import { formatLocale } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { getResponseAnswerRows } from '#utils/callouts';

/** Props for CalloutResponseCard */
export interface CalloutResponseCardProps {
  /** The form the response was submitted to */
  formSchema: GetCalloutFormSchema;
  /** The response's answers, by slide */
  answers: CalloutResponseAnswersSlide;
  /** When the response was submitted */
  submittedAt: Date;
  /** The card's heading. Omit to leave the card headerless */
  heading?: string;
}

const props = defineProps<CalloutResponseCardProps>();

const { t } = useI18n();

const rows = computed(() =>
  getResponseAnswerRows(props.formSchema, props.answers)
);
</script>
