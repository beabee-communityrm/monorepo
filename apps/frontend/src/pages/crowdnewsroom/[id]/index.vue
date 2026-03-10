<route lang="yaml">
name: callout
meta:
  pageTitle: menu.callouts
  noAuth: true
  embeddable: true
</route>

<template>
  <CalloutVariantsBox :callout="callout" />

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

    <div class="w-full md:max-w-2xl">
      <template v-if="!isRespondPage">
        <div v-if="callout.status === ItemStatus.Open" class="mb-6">
          <AppShareBox :url="`${env.appUrl}/crowdnewsroom/${callout.slug}`" />
        </div>
        <img class="mb-6 w-full" :src="imageUrl" />
        <div class="content-message mb-6 text-lg" v-html="callout.intro" />
      </template>

      <CalloutLoginPrompt v-if="showLoginPrompt" />
      <CalloutMemberOnlyPrompt v-else-if="showMemberOnlyPrompt && !isPreview" />
      <div v-else-if="canRespond || latestResponse">
        <AppButton
          v-if="canRespond && !isRespondPage"
          class="w-full"
          :to="{
            path: '/crowdnewsroom/' + callout.slug + '/respond',
            query: route.query,
          }"
        >
          {{
            latestResponse
              ? t('callout.actions.updateResponse')
              : t('actions.getStarted')
          }}
        </AppButton>

        <template v-else>
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
        </template>
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
  ItemStatus,
  type Paginated,
} from '@beabee/beabee-common';
import {
  AppButton,
  AppHeading,
  AppMessageBox,
  AppNotification,
  AppShareBox,
  AppTitle,
  addNotification,
  formatLocale,
} from '@beabee/vue';

import { faBullhorn, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { computed, onBeforeMount, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import noImage from '#assets/images/no-image.avif';
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
              title: t('menu.callouts'),
              to: '/admin/crowdnewsroom',
              icon: faBullhorn,
            },
            {
              title: props.callout.title,
              to: '/admin/crowdnewsroom/view/' + props.callout.slug,
            },
            { title: t('actions.preview') },
          ]
        : [
            {
              title: t('menu.callouts'),
              to: '/crowdnewsroom',
              icon: faBullhorn,
            },
            {
              title: props.callout.title,
              to: '/crowdnewsroom/' + props.callout.slug,
            },
            ...(props.respond ? [{ title: t('actions.respond') }] : []),
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
