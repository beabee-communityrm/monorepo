<template>
  <CalloutSidePanel :show="!!answers" @close="$emit('close')">
    <div v-if="showOnlyThanks">
      <CalloutThanksBox :callout="callout" class="p-0" />
      <AppShareBox :url="`${env.appUrl}/crowdnewsroom/${callout.slug}/map`" />
    </div>
    <template v-else>
      <CalloutLoginPrompt v-if="showLoginPrompt" />
      <CalloutMemberOnlyPrompt v-else-if="showMemberOnlyPrompt" />
      <CalloutForm
        v-else-if="answers"
        :answers="answers"
        :callout="callout"
        no-bg
        @submitted="handleSubmitted"
      />
    </template>
    <ul class="mt-8 w-full border-t border-primary-40 pt-4 text-sm">
      <li>
        <a :href="generalContent.privacyLink" class="text-link">{{
          t('footer.privacyPolicy')
        }}</a>
      </li>
      <li v-if="generalContent.termsLink">
        <a :href="generalContent.termsLink" class="text-link">{{
          t('footer.terms')
        }}</a>
      </li>
      <li v-if="generalContent.impressumLink">
        <a :href="generalContent.impressumLink" class="text-link">{{
          t('footer.impressum')
        }}</a>
      </li>
    </ul>
  </CalloutSidePanel>
</template>

<script lang="ts" setup>
import {
  type CalloutResponseAnswersSlide,
  type GetCalloutDataWith,
} from '@beabee/beabee-common';
import { AppShareBox } from '@beabee/vue';

import { ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import env from '#env';

import { generalContent } from '../../../store/generalContent';
import CalloutForm from './CalloutForm.vue';
import CalloutLoginPrompt from './CalloutLoginPrompt.vue';
import CalloutMemberOnlyPrompt from './CalloutMemberOnlyPrompt.vue';
import CalloutSidePanel from './CalloutSidePanel.vue';
import CalloutThanksBox from './CalloutThanksBox.vue';
import { useCallout } from './use-callout';

defineEmits<(e: 'close') => void>();
const props = defineProps<{
  callout: GetCalloutDataWith<'form'>;
  answers?: CalloutResponseAnswersSlide;
}>();

const { t } = useI18n();

const showOnlyThanks = ref(false);

const { showLoginPrompt, showMemberOnlyPrompt } = useCallout(
  toRef(props, 'callout')
);

watch(toRef(props, 'answers'), () => {
  showOnlyThanks.value = false;
});

function handleSubmitted() {
  showOnlyThanks.value = true;
}
</script>
