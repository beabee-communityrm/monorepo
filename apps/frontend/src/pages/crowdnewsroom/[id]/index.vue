<route lang="yaml">
name: callout
meta:
  pageTitle: menu.callouts
  noAuth: true
  embeddable: true
</route>

<template>
  <!-- The respond route and embeds render this page too, via respond.vue and
       `isEmbed`. For clarity they're split here rather than branching throughout. -->
  <div
    v-if="isRespondPage"
    class="nuxt-page mx-auto flex w-full max-w-[720px] flex-col gap-6"
  >
    <CalloutPreviewBar v-if="isPreview && !isEmbed" />

    <div class="flex w-full justify-end">
      <CalloutLanguageSelect :callout="callout" />
    </div>

    <h2 v-if="!isEmbed" class="text-xl">{{ callout.title }}</h2>

    <template v-if="responsesPaginated /* Avoids layout thrashing */">
      <CalloutLoginGate v-if="showLoginPrompt && isOpen" />

      <CalloutContributionGate
        v-else-if="showMemberOnlyPrompt && isOpen && !isPreview"
      />

      <CalloutForm
        v-else-if="canRespond"
        :callout="callout"
        :answers="prefilledAnswers"
        :preview="isPreview"
        :no-bg="isEmbed"
        @submitted="handleSubmitResponse"
      />

      <!-- Landing here without being able to respond, so show what they sent -->
      <CalloutResponseList
        v-else-if="responses.length"
        :form-schema="callout.formSchema"
        :responses="responses"
      />
    </template>
  </div>

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

    <template v-if="responsesPaginated /* Avoids layout thrashing */">
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
import {
  type CalloutResponseAnswersSlide,
  type GetCalloutDataWith,
  type GetCalloutResponseDataWith,
  type Paginated,
  GetCalloutResponseWith,
  ItemStatus,
  getCalloutResponseSettings,
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

const responsesPaginated =
  ref<Paginated<GetCalloutResponseDataWith<GetCalloutResponseWith.Answers>>>();

/** The current user's responses, newest first */
const responses = computed(() => responsesPaginated.value?.items ?? []);

const responseSettings = computed(() =>
  getCalloutResponseSettings(props.callout)
);

const editableResponse = computed(() =>
  responseSettings.value === 'singleEditable' ? responses.value[0] : undefined
);

const respondTo = computed(() => ({
  path: '/crowdnewsroom/' + props.callout.slug + '/respond',
  query: route.query,
}));

/** Which respond action is open to them, if any */
const respondAction = computed<'start' | 'add' | 'edit' | null>(() => {
  if (!canRespond.value) return null;
  if (!responses.value.length) return 'start';

  switch (responseSettings.value) {
    case 'multiple':
      return 'add';
    case 'singleEditable':
      return 'edit';
    case 'singleNonEditable':
    default:
      return null;
  }
});

const prefilledAnswers = computed(() =>
  route.query.answers
    ? (JSON.parse(
        route.query.answers.toString()
      ) as CalloutResponseAnswersSlide)
    : editableResponse.value?.answers
);

const canRespond = computed(
  () =>
    // Preview mode
    isPreview.value ||
    // Callout is open and current user has access
    (isOpen.value &&
      !showLoginPrompt.value &&
      !showMemberOnlyPrompt.value &&
      // Only a non-editable single response is used up by responding
      (responseSettings.value !== 'singleNonEditable' ||
        !responses.value.length))
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
  responsesPaginated.value =
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
