<route lang="yaml">
name: callout
meta:
  pageTitle: menu.callouts
  noAuth: true
  embeddable: true
</route>

<template>
  <!-- Embedded iframes point at this route rather than /respond, so an
       embed renders the respond experience directly here. -->
  <CalloutRespond v-if="isEmbed" :callout="callout" />

  <div
    v-else
    class="nuxt-page mx-auto flex w-full max-w-[720px] flex-col gap-6"
  >
    <CalloutPreviewBar v-if="isPreview" />

    <div class="flex w-full flex-wrap items-center justify-end gap-4">
      <div class="mr-auto flex flex-wrap items-center gap-2">
        <UBadge
          :color="isOpen ? 'success' : 'neutral'"
          variant="subtle"
          size="lg"
        >
          <span class="size-1.5 rounded-full bg-current" />
          {{ t(`common.status.${callout.status}`) }}
        </UBadge>
        <span v-if="daysLeft !== null" class="text-muted">
          <i18n-t keypath="callouts.daysLeft" :plural="daysLeft">
            <template #n>{{ daysLeft }}</template>
          </i18n-t>
        </span>
        <span v-else-if="callout.expires" class="text-muted">
          {{
            t('callout.closedOn', {
              date: formatLocale(callout.expires, 'd MMM yyyy'),
            })
          }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <CalloutLanguageSelect :callout="callout" />

        <CalloutSharePopover
          v-if="callout.status === ItemStatus.Open"
          :url="`${env.appUrl}/crowdnewsroom/${callout.slug}`"
        />
      </div>
    </div>

    <h2 class="text-xl">{{ callout.title }}</h2>

    <template v-if="responses /* Avoids layout thrashing */">
      <CalloutThankYouBanner
        v-if="responses.length"
        :callout="callout"
        :submitted-at="responses[0].createdAt"
      />

      <img class="w-full" :src="imageUrl" alt="" />
      <div class="nuxt-prose text-base" v-html="callout.intro" />

      <CalloutLoginGate v-if="showLoginPrompt && isOpen" />

      <CalloutContributionGate
        v-else-if="showMemberOnlyPrompt && isOpen && !isPreview"
      />

      <UButton
        v-else-if="respondAction === 'start'"
        size="xl"
        class="w-full"
        :to="respondTo"
      >
        {{ t('actions.getStarted') }}
      </UButton>

      <CalloutResponseList
        v-else-if="responses.length"
        :form-schema="callout.formSchema"
        :responses="responses"
        :add-to="respondAction === 'add' ? respondTo : undefined"
        :edit-to="respondAction === 'edit' ? respondTo : undefined"
      />
    </template>
  </div>
</template>
<script lang="ts" setup>
import { type GetCalloutDataWith, ItemStatus } from '@beabee/beabee-common';
import { formatLocale } from '@beabee/vue';

import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import noImage from '#assets/images/no-image.avif';
import CalloutContributionGate from '#components/callout/CalloutContributionGate.vue';
import CalloutLanguageSelect from '#components/callout/CalloutLanguageSelect.vue';
import CalloutLoginGate from '#components/callout/CalloutLoginGate.vue';
import CalloutPreviewBar from '#components/callout/CalloutPreviewBar.vue';
import CalloutResponseList from '#components/callout/CalloutResponseList.vue';
import CalloutSharePopover from '#components/callout/CalloutSharePopover.vue';
import CalloutThankYouBanner from '#components/callout/CalloutThankYouBanner.vue';
import CalloutRespond from '#components/pages/callouts/CalloutRespond.vue';
import {
  useCallout,
  useCalloutResponse,
} from '#components/pages/callouts/use-callout';
import env from '#env';
import { currentUser, isEmbed } from '#store';
import { addBreadcrumb } from '#store/breadcrumb';
import { getDaysLeft } from '#utils/callouts';
import { routeIcons, routeLabels } from '#utils/route-nav';
import { resolveImageUrl } from '#utils/url';

// Props: Receive the already processed callout from parent route
const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>;
}>();

const { t } = useI18n();
const route = useRoute();
const calloutRef = toRef(props, 'callout');

const { isOpen, isPreview, showLoginPrompt, showMemberOnlyPrompt } =
  useCallout(calloutRef);

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
          ]
      : []
  )
);

const imageUrl = computed(() => {
  return props.callout.image ? resolveImageUrl(props.callout.image) : noImage;
});

const daysLeft = computed(() => getDaysLeft(props.callout.expires));

const respondTo = computed(() => ({
  path: '/crowdnewsroom/' + props.callout.slug + '/respond',
  query: route.query,
}));

// Embeds render CalloutRespond directly instead, which fetches its own
// response state, so skip fetching it twice here.
const { responses, respondAction } = useCalloutResponse(calloutRef, {
  fetchResponses: !isEmbed,
});
</script>
