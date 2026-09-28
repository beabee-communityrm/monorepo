<route lang="yaml">
name: calloutThanks
meta:
  pageTitle: menu.callouts
  noAuth: true
  embeddable: true
</route>
<template>
  <div class="nuxt-page mx-auto flex w-full max-w-[720px] flex-col gap-6">
    <div class="flex w-full flex-wrap items-center justify-end gap-2">
      <CalloutLanguageSelect :callout="callout" />

      <CalloutSharePopover
        :url="`${env.appUrl}/crowdnewsroom/${callout.slug}`"
      />
    </div>

    <h2 v-if="!isEmbed" class="text-lg">{{ callout.title }}</h2>

    <template v-if="responses /* Avoids layout thrashing */">
      <CalloutThankYouBanner
        :callout="callout"
        :submitted-at="responses[0]?.createdAt"
      />

      <CalloutResponseList
        v-if="responses.length"
        :form-schema="callout.formSchema"
        :responses="responses.slice(0, 1)"
        :add-to="respondAction === 'add' ? respondTo : undefined"
        :edit-to="respondAction === 'edit' ? respondTo : undefined"
      />
    </template>
  </div>
</template>
<script lang="ts" setup>
import type { GetCalloutDataWith } from '@beabee/beabee-common';
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import CalloutLanguageSelect from '#components/callout/CalloutLanguageSelect.vue';
import CalloutResponseList from '#components/callout/CalloutResponseList.vue';
import CalloutSharePopover from '#components/callout/CalloutSharePopover.vue';
import CalloutThankYouBanner from '#components/callout/CalloutThankYouBanner.vue';
import { useCalloutResponse } from '#components/pages/callouts/use-callout';
import env from '#env';
import { addBreadcrumb } from '#store/breadcrumb';
import { currentUser, isEmbed } from '#store/index';
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
