<route lang="yaml">
name: callout
meta:
  pageTitle: menu.callouts
  noAuth: true
  embeddable: true
</route>

<template>
  <CalloutVariantsBox :callout="callout" />

  <div v-if="!isRespondPage" class="mb-2 flex flex-wrap items-center gap-2">
    <UBadge :color="isOpen ? 'success' : 'neutral'" variant="subtle">
      <span class="size-1.5 rounded-full bg-current" />
      {{ t(`common.status.${callout.status}`) }}
    </UBadge>
    <span v-if="statusDetail" class="text-muted text-sm">{{
      statusDetail
    }}</span>
  </div>

  <AppTitle v-if="!isEmbed" big>{{ callout.title }}</AppTitle>

  <template v-if="responses /* Avoids layout thrashing */">
    <CalloutThanksBox v-if="latestResponse" :callout="callout" class="mb-6" />
    <AppMessageBox
      v-else-if="!isOpen && callout.expires /* Type narrowing */"
      :title="
        t('callout.ended', { date: formatLocale(callout.expires, 'PPP') })
      "
      :icon="faInfoCircle"
      class="mb-6"
      variant="info"
    />

    <div v-if="isRespondPage" class="w-full md:max-w-2xl">
      <CalloutLoginPrompt v-if="showLoginPrompt" />
      <CalloutMemberOnlyPrompt v-else-if="showMemberOnlyPrompt && !isPreview" />
      <div v-else-if="canRespond || latestResponse">
        <AppNotification
          v-if="isPreview"
          variant="warning"
          :title="t('callout.showingPreview')"
          class="mb-4"
        />

        <AppHeading v-if="latestResponse" class="mt-6">
          {{ t('callout.yourResponse') }}
        </AppHeading>

        <CalloutForm
          :callout="callout"
          :answers="prefilledAnswers"
          :preview="isPreview"
          :readonly="!canRespond"
          :all-slides="!canRespond"
          :no-bg="isEmbed"
          @submitted="handleSubmitResponse"
        />
      </div>
    </div>

    <div
      v-else
      class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start"
    >
      <div class="flex min-w-0 flex-col gap-6">
        <img class="h-[220px] w-full rounded-xl object-cover" :src="imageUrl" />
        <div class="content-message text-lg" v-html="callout.intro" />
      </div>

      <div class="nuxt-page flex flex-col gap-4 lg:sticky lg:top-6">
        <CalloutLoginPrompt v-if="showLoginPrompt" />
        <CalloutMemberOnlyPrompt
          v-else-if="showMemberOnlyPrompt && !isPreview"
        />
        <template v-else-if="canRespond || latestResponse">
          <AppNotification
            v-if="isPreview"
            variant="warning"
            :title="t('callout.showingPreview')"
          />
          <CalloutResponseCard
            :respond-to="{
              path: '/crowdnewsroom/' + callout.slug + '/respond',
              query: route.query,
            }"
            :has-responded="!!latestResponse"
            :can-update="canUpdateResponse"
            :submitted-at="latestResponse?.createdAt"
          />
        </template>

        <CalloutAboutCard
          v-if="callout.starts"
          :starts="callout.starts"
          :expires="callout.expires ?? undefined"
          :response-count="callout.responseCount"
          :access="callout.access"
          :share-url="`${env.appUrl}/crowdnewsroom/${callout.slug}`"
        />
      </div>
    </div>
  </template>
</template>
<script lang="ts" setup>
import {
  type CalloutResponseAnswersSlide,
  type GetCalloutDataWith,
  type GetCalloutResponseDataWith,
  GetCalloutResponseWith,
  type Paginated,
} from '@beabee/beabee-common';
import {
  AppHeading,
  AppMessageBox,
  AppNotification,
  AppTitle,
  addNotification,
  formatDistanceLocale,
  formatLocale,
} from '@beabee/vue';

import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { computed, onBeforeMount, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import noImage from '#assets/images/no-image.avif';
import CalloutAboutCard from '#components/callout/CalloutAboutCard.vue';
import CalloutResponseCard from '#components/callout/CalloutResponseCard.vue';
import CalloutForm from '#components/pages/callouts/CalloutForm.vue';
import CalloutLoginPrompt from '#components/pages/callouts/CalloutLoginPrompt.vue';
import CalloutMemberOnlyPrompt from '#components/pages/callouts/CalloutMemberOnlyPrompt.vue';
import CalloutThanksBox from '#components/pages/callouts/CalloutThanksBox.vue';
import CalloutVariantsBox from '#components/pages/callouts/CalloutVariantsBox.vue';
import { useCallout } from '#components/pages/callouts/use-callout';
import env from '#env';
import { currentUser, isEmbed } from '#store';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { routeIcons, routeLabels } from '#utils/route-nav';
import { resolveImageUrl } from '#utils/url';

// Props: Receive the already processed callout from parent route
const props = defineProps<{
  callout: GetCalloutDataWith<
    'form' | 'responseViewSchema' | 'variantNames' | 'responseCount'
  >;
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

// Contextual time next to the status badge, e.g. "ends in 5 days" / "ended 2 days ago"
const statusDetail = computed(() => {
  if (isOpen.value && props.callout.expires) {
    return t('item.status.endsIn', {
      duration: formatDistanceLocale(props.callout.expires, new Date()),
    });
  }
  if (!isOpen.value && props.callout.expires) {
    return t('common.timeAgo', {
      time: formatDistanceLocale(props.callout.expires, new Date()),
    });
  }
  return '';
});

// Whether an existing response can still be edited
const canUpdateResponse = computed(
  () => isOpen.value && props.callout.allowUpdate
);

const responses =
  ref<Paginated<GetCalloutResponseDataWith<GetCalloutResponseWith.Answers>>>();
const latestResponse = computed(() =>
  props.callout.allowMultiple ? undefined : responses.value?.items?.[0]
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
