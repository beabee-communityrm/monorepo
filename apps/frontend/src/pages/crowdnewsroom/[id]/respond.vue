<route lang="yaml">
name: calloutRespond
meta:
  pageTitle: menu.callouts
  noAuth: true
</route>
<template>
  <CalloutRespond :callout="callout" />
</template>
<script lang="ts" setup>
import type { GetCalloutDataWith } from '@beabee/beabee-common';

import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import CalloutRespond from '#components/pages/callouts/CalloutRespond.vue';
import { useCallout } from '#components/pages/callouts/use-callout';
import { currentUser } from '#store';
import { addBreadcrumb } from '#store/breadcrumb';
import { routeIcons, routeLabels } from '#utils/route-nav';

const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>;
}>();

const { t } = useI18n();
const { isPreview } = useCallout(toRef(props, 'callout'));

addBreadcrumb(
  computed(() =>
    currentUser.value
      ? isPreview.value
        ? [
            {
              label: t(routeLabels.adminCallouts),
              to: '/admin/crowdnewsroom',
              icon: routeIcons.adminCallouts,
            },
            {
              label: props.callout.title,
              to: '/admin/crowdnewsroom/view/' + props.callout.slug,
            },
            { label: t('actions.preview') },
          ]
        : [
            {
              label: t(routeLabels.callouts),
              to: '/crowdnewsroom',
              icon: routeIcons.callouts,
            },
            {
              label: props.callout.title,
              to: '/crowdnewsroom/' + props.callout.slug,
            },
            { label: t('actions.respond') },
          ]
      : []
  )
);
</script>
