<route lang="yaml">
name: callout
meta:
  pageTitle: menu.callouts
  noAuth: true
  embeddable: true
</route>

<template>
  <div class="nuxt-page mx-auto flex w-full max-w-[720px] flex-col gap-6">
    <CalloutPreviewBar v-if="isPreview && !isEmbed" />

    <div class="flex w-full flex-wrap items-center justify-end gap-4">
      <div
        v-if="!isRespondPage"
        class="mr-auto flex flex-wrap items-center gap-2"
      >
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
          v-if="!isRespondPage && callout.status === ItemStatus.Open"
          :url="`${env.appUrl}/crowdnewsroom/${callout.slug}`"
        />
      </div>
    </div>

    <h2 v-if="!isEmbed" class="text-xl">{{ callout.title }}</h2>

    <template v-if="responses /* Avoids layout thrashing */">
      <CalloutThankYouBanner
        v-if="myResponses.length && !isRespondPage"
        :callout="callout"
        :submitted-at="myResponses[0].createdAt"
      />
      <template v-if="!isRespondPage">
        <img class="w-full" :src="imageUrl" alt="" />
        <div class="nuxt-prose text-base" v-html="callout.intro" />
      </template>

      <CalloutLoginGate v-if="showLoginPrompt && isOpen" />

      <CalloutContributionGate
        v-else-if="showMemberOnlyPrompt && isOpen && !isPreview"
      />
      <UButton
        v-else-if="canRespond && !isRespondPage && !myResponses.length"
        size="xl"
        class="w-full"
        :to="respondTo"
      >
        {{ t('actions.getStarted') }}
      </UButton>

      <!-- Before the response list: both match when someone who has already
           responded is editing or adding another -->
      <CalloutForm
        v-else-if="isRespondPage && canRespond"
        :callout="callout"
        :answers="prefilledAnswers"
        :preview="isPreview"
        :no-bg="isEmbed"
        @submitted="handleSubmitResponse"
      />

      <CalloutResponseList
        v-else-if="myResponses.length"
        :form-schema="callout.formSchema"
        :responses="myResponses"
        :add-to="canAddAnother ? respondTo : undefined"
        :edit-to="canEditSingle ? respondTo : undefined"
      />
    </template>
  </div>
</template>
<script lang="ts" setup>
import {
  type CalloutResponseAnswersSlide,
  type GetCalloutDataWith,
  type GetCalloutResponseDataWith,
  GetCalloutResponseWith,
  ItemStatus,
  type Paginated,
} from '@beabee/beabee-common';
import { addNotification, formatLocale } from '@beabee/vue';

import { computed, onBeforeMount, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import noImage from '#assets/images/no-image.avif';
import CalloutContributionGate from '#components/callout/CalloutContributionGate.vue';
import CalloutLanguageSelect from '#components/callout/CalloutLanguageSelect.vue';
import CalloutLoginGate from '#components/callout/CalloutLoginGate.vue';
import CalloutPreviewBar from '#components/callout/CalloutPreviewBar.vue';
import CalloutResponseList from '#components/callout/CalloutResponseList.vue';
import CalloutSharePopover from '#components/callout/CalloutSharePopover.vue';
import CalloutThankYouBanner from '#components/callout/CalloutThankYouBanner.vue';
import CalloutForm from '#components/pages/callouts/CalloutForm.vue';
import { useCallout } from '#components/pages/callouts/use-callout';
import env from '#env';
import { currentUser, isEmbed } from '#store';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { getDaysLeft } from '#utils/callouts';
import { routeIcons, routeLabels } from '#utils/route-nav';
import { resolveImageUrl } from '#utils/url';

// Props: Receive the already processed callout from parent route
const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>;
  respond?: boolean; // Flag for /respond route
}>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

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
            ...(props.respond ? [{ label: t('actions.respond') }] : []),
          ]
      : []
  )
);

const isPreview = computed(
  () => route.query.preview === null && currentUser.value?.isReviewer
);

const isRespondPage = computed(() => isEmbed || props.respond);
const imageUrl = computed(() => {
  return props.callout.image ? resolveImageUrl(props.callout.image) : noImage;
});

const { isOpen, showLoginPrompt, showMemberOnlyPrompt } = useCallout(
  toRef(props, 'callout')
);

const daysLeft = computed(() => getDaysLeft(props.callout.expires));

const responses =
  ref<Paginated<GetCalloutResponseDataWith<GetCalloutResponseWith.Answers>>>();
// Guarded for allowMultiple because it also drives prefilling /respond and the
// "update your response" label, neither of which applies when every response
// is a new one. Use myResponses to display them.
const latestResponse = computed(() =>
  props.callout.allowMultiple ? undefined : responses.value?.items?.[0]
);

/** The current user's responses, newest first */
const myResponses = computed(() => responses.value?.items ?? []);

const respondTo = computed(() => ({
  path: '/crowdnewsroom/' + props.callout.slug + '/respond',
  query: route.query,
}));

/** Responding again is a fresh response, not an edit of an existing one */
const canAddAnother = computed(
  () =>
    canRespond.value &&
    !isRespondPage.value &&
    props.callout.allowMultiple &&
    myResponses.value.length > 0
);

// A callout is either editable or multi-response, never both — they come from
// one setting — so there's never more than one response to edit
const canEditSingle = computed(
  () =>
    canRespond.value &&
    !isRespondPage.value &&
    !props.callout.allowMultiple &&
    myResponses.value.length === 1
);

const prefilledAnswers = computed(() =>
  route.query.answers
    ? (JSON.parse(
        route.query.answers.toString()
      ) as CalloutResponseAnswersSlide)
    : latestResponse.value?.answers
);

const canRespond = computed(
  () =>
    // Preview mode
    isPreview.value ||
    // Callout is open and current user has access
    (isOpen.value &&
      !showLoginPrompt.value &&
      !showMemberOnlyPrompt.value &&
      // Current user hasn't responded or can update
      (!latestResponse.value || props.callout.allowUpdate))
);

function handleSubmitResponse() {
  if (props.callout.thanksRedirect) {
    window.location.href = props.callout.thanksRedirect;
  } else {
    router.push({
      path: `/crowdnewsroom/${props.callout.slug}/thanks`,
      query: route.query,
    });
  }

  addNotification({
    title: t('callout.responseSubmitted'),
    variant: 'success',
  });
}

onBeforeMount(async () => {
  responses.value =
    !isPreview.value && currentUser.value
      ? await client.callout.listResponses(
          props.callout.slug,
          {
            rules: {
              condition: 'AND',
              rules: [{ field: 'contact', operator: 'equal', value: ['me'] }],
            },
            sort: 'createdAt',
            order: 'DESC',
          },
          [GetCalloutResponseWith.Answers]
        )
      : { total: 0, count: 0, offset: 0, items: [] };
});
</script>
