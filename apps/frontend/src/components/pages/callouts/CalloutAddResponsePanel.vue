<template>
  <CalloutSidePanel :show="!!answers" @close="$emit('close')">
    <CalloutThanksBox v-if="showOnlyThanks" :callout="callout" class="p-0" />
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
  </CalloutSidePanel>
</template>

<script lang="ts" setup>
import { type CalloutResponseAnswers } from '@beabee/beabee-common';
import CalloutForm from './CalloutForm.vue';
import CalloutMemberOnlyPrompt from './CalloutMemberOnlyPrompt.vue';
import CalloutLoginPrompt from './CalloutLoginPrompt.vue';
import { useCallout } from './use-callout';
import { ref, toRef, watch } from 'vue';
import CalloutSidePanel from './CalloutSidePanel.vue';
import CalloutThanksBox from './CalloutThanksBox.vue';

import type { GetCalloutDataWith } from '@type';

defineEmits<(e: 'close') => void>();
const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'variantNames'>;
  answers?: CalloutResponseAnswers;
}>();

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
