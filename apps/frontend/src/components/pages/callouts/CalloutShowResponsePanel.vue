<template>
  <CalloutSidePanel :show="responses.length > 0" @close="$emit('close')">
    <div v-if="responses.length > 1" class="mb-4 flex items-center gap-4">
      <AppButtonGroup>
        <AppButton
          variant="primaryOutlined"
          :icon="faArrowLeft"
          :disabled="responseIndex === 0"
          @click="changeResponse(-1)"
        />
        <AppButton
          variant="primaryOutlined"
          :icon="faArrowRight"
          :disabled="responseIndex === responses.length - 1"
          @click="changeResponse(1)"
        />
      </AppButtonGroup>
      <span> Response {{ responseIndex + 1 }} of {{ responses.length }} </span>
    </div>
    <CalloutResponse :callout="callout" :response="responses[responseIndex]" />
  </CalloutSidePanel>
</template>

<script lang="ts" setup>
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { ref, watch } from 'vue';

import CalloutSidePanel from './CalloutSidePanel.vue';
import {
  type GetCalloutDataWith,
  type GetCalloutResponseMapData,
} from '@beabee/beabee-common';
import CalloutResponse from './CalloutResponse.vue';
import AppButton from '@components/button/AppButton.vue';
import AppButtonGroup from '@components/button/AppButtonGroup.vue';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'change', responseNumber: number): void;
}>();
const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseViewSchema'>;
  responses: GetCalloutResponseMapData[];
}>();

const responseIndex = ref(0);

function changeResponse(inc: number) {
  responseIndex.value = Math.max(
    0,
    Math.min(props.responses.length - 1, responseIndex.value + inc)
  );
  emit('change', props.responses[responseIndex.value].number);
}

watch(
  () => props.responses,
  () => {
    responseIndex.value = 0;
  }
);
</script>
