<route lang="yaml">
name: calloutThanks
meta:
  pageTitle: menu.callouts
  noAuth: true
  embeddable: true
</route>
<template>
  <div class="nuxt-page mx-auto flex w-full max-w-[720px] flex-col gap-6">
    <div class="flex w-full justify-end">
      <CalloutLanguageSelect :callout="callout" />
    </div>

    <h1 v-if="!isEmbed" class="text-xl">{{ callout.title }}</h1>

    <CalloutThankYouBanner :callout="callout" :level="2" size="lg" />

    <template v-if="responses">
      <CalloutResponseList
        v-if="responses.length"
        :form-schema="callout.formSchema"
        :responses="latestResponse"
        hide-date
        :add-to="respondAction === 'add' ? respondTo : undefined"
        :edit-to="respondAction === 'edit' ? respondTo : undefined"
      />
    </template>

    <LoadError
      v-else-if="responsesError"
      :retry="loadResponses"
      keypath="callout.loadResponsesError"
      class="py-8 text-center"
    />

    <div v-else class="flex flex-col gap-3">
      <h3 class="text-lg">{{ t('callout.yourResponse') }}</h3>
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <div class="divide-y divide-muted/50">
          <div
            v-for="n in 3"
            :key="n"
            class="flex flex-col gap-1 px-4 py-4 sm:px-6"
          >
            <USkeleton class="h-5 w-1/3" />
            <USkeleton class="h-5 w-1/2" />
          </div>
        </div>
      </UCard>
    </div>

    <UCard
      v-if="callout.status === ItemStatus.Open"
      class="bg-tint-primary ring-primary/20"
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <p>{{ t('calloutThanksPage.sharePrompt') }}</p>
        <CalloutSharePopover
          :url="`${env.appUrl}/crowdnewsroom/${callout.slug}`"
          color="primary"
        />
      </div>
    </UCard>

    <div v-if="!isEmbed">
      <UButton
        variant="link"
        icon="i-lucide-arrow-left"
        :to="{ path: '/crowdnewsroom/' + callout.slug, query: route.query }"
      >
        {{ t('calloutThanksPage.backTo', { title: callout.title }) }}
      </UButton>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { type GetCalloutDataWith, ItemStatus } from '@beabee/beabee-common';
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import CalloutLanguageSelect from '#components/callout/CalloutLanguageSelect.vue';
import CalloutResponseList from '#components/callout/CalloutResponseList.vue';
import CalloutSharePopover from '#components/callout/CalloutSharePopover.vue';
import CalloutThankYouBanner from '#components/callout/CalloutThankYouBanner.vue';
import LoadError from '#components/LoadError.vue';
import { useCalloutResponse } from '#components/pages/callouts/use-callout';
import env from '#env';
import { addBreadcrumb } from '#store/breadcrumb';
import { currentUser, isEmbed } from '#store/index';
import { routeIcons, routeLabels } from '#utils/route-nav';

const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'variantNames'>;
}>();

const { t } = useI18n();
const route = useRoute();

addBreadcrumb(
  computed(() =>
    currentUser.value
      ? [
          {
            label: t(routeLabels.callouts),
            to: '/crowdnewsroom',
            icon: routeIcons.callouts,
          },
          {
            label: props.callout.title,
            to: '/crowdnewsroom/' + props.callout.slug,
          },
        ]
      : []
  )
);

const { responses, responsesError, loadResponses, respondAction, respondTo } =
  useCalloutResponse(toRef(props, 'callout'));

/** Only the response just submitted, so the list shows it on its own */
const latestResponse = computed(() => ({
  total: 1,
  count: 1,
  offset: 0,
  items: responses.value?.slice(0, 1) ?? [],
}));
</script>
