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
    <AppShareBox
      :address-text="t('callout.share.address')"
      :services-text="t('callout.share.services')"
      :url="`/callouts/${callout.slug}`"
    />
  </div>
</template>
<script lang="ts" setup>
import type { GetCalloutDataWith } from '@beabee/beabee-common';
import CalloutVariantsBox from '@components/pages/callouts/CalloutVariantsBox.vue';
import AppTitle from '@components/AppTitle.vue';
import CalloutThanksBox from '@components/pages/callouts/CalloutThanksBox.vue';
import { currentUser, isEmbed } from '@store/index';
import { addBreadcrumb } from '@store/breadcrumb';
import { computed } from 'vue';
import { faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';
import AppShareBox from '@components/AppShareBox.vue';

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
            to: '/callouts',
            icon: faBullhorn,
          },
          {
            title: props.callout.title,
            to: '/callouts/' + props.callout.slug,
          },
        ]
      : []
  )
);
</script>
