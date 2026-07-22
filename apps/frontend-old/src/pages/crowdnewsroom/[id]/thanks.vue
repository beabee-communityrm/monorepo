<route lang="yaml">
name: calloutThanks
meta:
  pageTitle: menu.callouts
  noAuth: true
  embeddable: true
</route>
<template>
  <CalloutVariantsBox :callout="callout" />
  <AppTitle v-if="!isEmbed" big>{{ callout.title }}</AppTitle>
  <CalloutThanksBox :callout="callout" class="mb-6" />
  <div class="w-full md:max-w-2xl">
    <AppShareBox :url="`${env.appUrl}/crowdnewsroom/${callout.slug}`" />
  </div>
</template>
<script lang="ts" setup>
import type { GetCalloutDataWith } from '@beabee/beabee-common';
import { AppShareBox, AppTitle } from '@beabee/vue';

import { faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import CalloutThanksBox from '#components/pages/callouts/CalloutThanksBox.vue';
import CalloutVariantsBox from '#components/pages/callouts/CalloutVariantsBox.vue';
import env from '#env';
import { addBreadcrumb } from '#store/breadcrumb';
import { currentUser, isEmbed } from '#store/index';

const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'variantNames'>;
}>();

const { t } = useI18n();

addBreadcrumb(
  computed(() =>
    currentUser.value
      ? [
          {
            title: t('menu.callouts'),
            to: '/crowdnewsroom',
            icon: faBullhorn,
          },
          {
            title: props.callout.title,
            to: '/crowdnewsroom/' + props.callout.slug,
          },
        ]
      : []
  )
);
</script>
