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
              date: formatLocale(callout.expires, 'PPP'),
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

    <h1 class="text-xl">{{ callout.title }}</h1>

    <template v-if="responses || responsesError">
      <CalloutThankYouBanner
        v-if="responses?.length"
        :callout="callout"
        :submitted-at="responses[0].createdAt"
      />

      <img class="w-full" :src="imageUrl" alt="" />
      <div class="nuxt-prose text-base" v-html="callout.intro" />

      <CalloutLoginGate v-if="showLoginPrompt && isOpen" />

      <CalloutContributionGate
        v-else-if="showMemberOnlyPrompt && isOpen && !isPreview"
      />

      <LoadError
        v-else-if="responsesError"
        :retry="retryResponses"
        keypath="callout.loadResponsesError"
        class="py-8 text-center"
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
        v-if="responsesPaginated?.items.length"
        ref="responseList"
        :form-schema="callout.formSchema"
        :responses="responsesPaginated"
        :add-to="respondAction === 'add' ? respondTo : undefined"
        :edit-to="respondAction === 'edit' ? respondTo : undefined"
      />
    </template>

    <template v-else>
      <USkeleton class="aspect-video w-full bg-accented" />
      <div class="space-y-2">
        <USkeleton class="h-4 w-full bg-accented" />
        <USkeleton class="h-4 w-full bg-accented" />
        <USkeleton class="h-4 w-2/3 bg-accented" />
      </div>
      <USkeleton class="h-12 w-full bg-accented" />
    </template>
  </div>
</template>
<script lang="ts" setup>
import { type GetCalloutDataWith, ItemStatus } from '@beabee/beabee-common';
import { formatLocale } from '@beabee/vue';

import { computed, nextTick, toRef, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

import CalloutContributionGate from '#components/callout/CalloutContributionGate.vue';
import CalloutLanguageSelect from '#components/callout/CalloutLanguageSelect.vue';
import CalloutLoginGate from '#components/callout/CalloutLoginGate.vue';
import CalloutPreviewBar from '#components/callout/CalloutPreviewBar.vue';
import CalloutResponseList from '#components/callout/CalloutResponseList.vue';
import CalloutSharePopover from '#components/callout/CalloutSharePopover.vue';
import CalloutThankYouBanner from '#components/callout/CalloutThankYouBanner.vue';
import LoadError from '#components/LoadError.vue';
import CalloutRespond from '#components/pages/callouts/CalloutRespond.vue';
import {
  useCallout,
  useCalloutResponse,
} from '#components/pages/callouts/use-callout';
import env from '#env';
import { currentUser, isEmbed } from '#store';
import { addBreadcrumb } from '#store/breadcrumb';
import { getCalloutImageUrl, getDaysLeft } from '#utils/callouts';
import { routeIcons, routeLabels } from '#utils/route-nav';

// Props: Receive the already processed callout from parent route
const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>;
}>();

const { t } = useI18n();
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

const imageUrl = computed(() => getCalloutImageUrl(props.callout));

const daysLeft = computed(() => getDaysLeft(props.callout.expires));

// Embeds render CalloutRespond directly instead, which fetches its own
// response state, so skip fetching it twice here.
const {
  responses,
  responsesPaginated,
  responsesError,
  loadResponses,
  respondAction,
  respondTo,
} = useCalloutResponse(calloutRef, {
  fetchResponses: !isEmbed,
});

const responseList = useTemplateRef('responseList');

/** Loads the responses again, moving focus to them if there are any */
async function retryResponses() {
  await loadResponses();
  await nextTick();
  await responseList.value?.focusHeading();
}
</script>
