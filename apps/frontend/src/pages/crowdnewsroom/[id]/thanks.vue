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

    <template v-if="responses /* Avoids layout thrashing */">
      <CalloutThankYouBanner :callout="callout" :level="2" size="lg" />

      <CalloutResponseList
        v-if="responses.length"
        :form-schema="callout.formSchema"
        :responses="responses.slice(0, 1)"
        hide-date
        :add-to="respondAction === 'add' ? respondTo : undefined"
        :edit-to="respondAction === 'edit' ? respondTo : undefined"
      />
    </template>

    <UCard
      v-if="callout.status === ItemStatus.Open"
      class="bg-linear-to-b from-primary/5 to-transparent to-70% ring-primary/20"
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <p>{{ t('calloutThanksPage.sharePrompt') }}</p>
        <CalloutSharePopover
          :url="`${env.appUrl}/crowdnewsroom/${callout.slug}`"
          color="primary"
        />
      </div>
    </UCard>
  </div>
</template>
<script lang="ts" setup>
import { type GetCalloutDataWith, ItemStatus } from '@beabee/beabee-common';
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import CalloutLanguageSelect from '#components/callout/CalloutLanguageSelect.vue';
import CalloutResponseList from '#components/callout/CalloutResponseList.vue';
import CalloutSharePopover from '#components/callout/CalloutSharePopover.vue';
import CalloutThankYouBanner from '#components/callout/CalloutThankYouBanner.vue';
import { useCalloutResponse } from '#components/pages/callouts/use-callout';
import env from '#env';
import { addBreadcrumb } from '#store/breadcrumb';
import { currentUser } from '#store/index';
import { routeIcons, routeLabels } from '#utils/route-nav';

const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'variantNames'>;
}>();

const { t } = useI18n();

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

const { responses, respondAction, respondTo } = useCalloutResponse(
  toRef(props, 'callout')
);
</script>
