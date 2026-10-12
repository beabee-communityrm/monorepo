<!--
  # CalloutResponseList
  The current user's responses to a CrowdNewsroom, with a heading and whichever
  action is open to them. Each response is shown back as a list of questions and
  their answers. Read-only — editing goes through CalloutForm on /respond.

  Several responses are shown one at a time, newest first, paged from the card
  header. A single response has no card header, so its date sits alongside the
  heading instead.
-->
<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3">
      <div class="flex flex-wrap items-baseline gap-x-3">
        <h3 class="text-lg">{{ heading }}</h3>
        <p v-if="count === 1" class="text-muted">{{ submittedOn }}</p>
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

    <UCard
      :ui="{
        body: 'p-0 sm:p-0',
      }"
    >
      <template v-if="count > 1" #header>
        <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div class="flex flex-col gap-1">
            <h4>
              {{
                t('callout.responseNumber', {
                  number: count - index,
                  total: count,
                })
              }}
            </h4>
            <p class="text-muted">{{ submittedOn }}</p>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-chevron-left"
              :aria-label="t('callout.previousResponse')"
              :disabled="index === count - 1"
              @click="index++"
            />
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-chevron-right"
              :aria-label="t('callout.nextResponse')"
              :disabled="index === 0"
              @click="index--"
            />
          </div>
        </div>
      </template>

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
  </div>
</template>

<script lang="ts" setup>
import type {
  GetCalloutFormSchema,
  GetCalloutResponseDataWith,
  GetCalloutResponseWith,
  Paginated,
} from '@beabee/beabee-common';
import { formatLocale } from '@beabee/vue';

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RouteLocationRaw } from 'vue-router';

import { getResponseAnswerRows } from '#utils/callouts';

/** Props for CalloutResponseList */
export interface CalloutResponseListProps {
  /** The form the responses were submitted to */
  formSchema: GetCalloutFormSchema;
  /** The current user's responses, newest first. Expects at least one */
  responses: Paginated<
    GetCalloutResponseDataWith<GetCalloutResponseWith.Answers>
  >;
  /** Where adding another response goes, if more are allowed */
  addTo?: RouteLocationRaw;
  /** Where editing goes, if the one response can still be edited */
  editTo?: RouteLocationRaw;
}

const props = defineProps<CalloutResponseListProps>();

const { t } = useI18n();

/** Position in the loaded responses, so 0 is the newest */
const index = ref(0);

const count = computed(() => props.responses.items.length);
const response = computed(() => props.responses.items[index.value]);

const heading = computed(() =>
  props.responses.total > 1
    ? t('callout.yourResponses', { count: props.responses.total })
    : t('callout.yourResponse')
);

const submittedOn = computed(() =>
  t('callout.submittedOn', {
    date: formatLocale(response.value.createdAt, 'PPP'),
  })
);

const rows = computed(() =>
  getResponseAnswerRows(props.formSchema, response.value.answers)
);
</script>
