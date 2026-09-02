<route lang="yaml">
name: calloutThanks
meta:
  pageTitle: menu.callouts
  noAuth: true
  embeddable: true
</route>
<template>
  <div class="nuxt-page mx-auto flex w-full max-w-[720px] flex-col gap-6">
    <CalloutLanguageSelect :callout="callout" />
    <AppTitle v-if="!isEmbed" big>{{ callout.title }}</AppTitle>
    <CalloutThankYouBanner :callout="callout" />
    <AppShareBox :url="`${env.appUrl}/crowdnewsroom/${callout.slug}`" />
  </div>
</template>
<script lang="ts" setup>
import type { GetCalloutDataWith } from '@beabee/beabee-common';
import { AppShareBox, AppTitle } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import CalloutLanguageSelect from '#components/callout/CalloutLanguageSelect.vue';
import CalloutThankYouBanner from '#components/callout/CalloutThankYouBanner.vue';
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
</script>
