<template>
  <div class="nuxt-page mx-auto flex w-full max-w-[720px] flex-col gap-6">
    <CalloutPreviewBar v-if="isPreview && !isEmbed" />

    <div class="flex w-full justify-end">
      <CalloutLanguageSelect :callout="callout" />
    </div>

    <h2 v-if="!isEmbed" class="text-xl">{{ callout.title }}</h2>

    <template v-if="responses /* Avoids layout thrashing */">
      <CalloutClosedNotice
        v-if="
          callout.status === ItemStatus.Ended && callout.expires && !isPreview
        "
        :expires="callout.expires"
      />

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
        v-if="!canRespond && responsesPaginated?.items.length"
        :form-schema="callout.formSchema"
        :responses="responsesPaginated"
      />
    </template>
  </div>
</template>
<script lang="ts" setup>
import {
  type CalloutResponseAnswersSlide,
  type GetCalloutDataWith,
  ItemStatus,
} from '@beabee/beabee-common';
import { addNotification } from '@beabee/vue';

import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import CalloutClosedNotice from '#components/callout/CalloutClosedNotice.vue';
import CalloutContributionGate from '#components/callout/CalloutContributionGate.vue';
import CalloutLanguageSelect from '#components/callout/CalloutLanguageSelect.vue';
import CalloutLoginGate from '#components/callout/CalloutLoginGate.vue';
import CalloutPreviewBar from '#components/callout/CalloutPreviewBar.vue';
import CalloutResponseList from '#components/callout/CalloutResponseList.vue';
import CalloutForm from '#components/pages/callouts/CalloutForm.vue';
import {
  useCallout,
  useCalloutResponse,
} from '#components/pages/callouts/use-callout';
import { isEmbed } from '#store';

const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>;
}>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const calloutRef = toRef(props, 'callout');

const { isOpen, isPreview, showLoginPrompt, showMemberOnlyPrompt } =
  useCallout(calloutRef);

const { responses, responsesPaginated, canRespond, respondAction } =
  useCalloutResponse(calloutRef);

/** An explicit answers override from the URL, or the user's own response
 * when it's the single one they're allowed to edit */
const prefilledAnswers = computed<CalloutResponseAnswersSlide | undefined>(
  () => {
    if (route.query.answers) {
      return JSON.parse(
        route.query.answers.toString()
      ) as CalloutResponseAnswersSlide;
    }

    return respondAction.value === 'edit'
      ? responses.value?.[0]?.answers
      : undefined;
  }
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
</script>
