<template>
  <CalloutSidePanel :show="responses.length > 0" @close="$emit('close')">
    <div v-if="responses.length > 1" class="mb-4 flex items-center gap-4">
      <AppButtonGroup>
        <AppButton
          variant="link"
          :icon="faArrowLeft"
          :disabled="responseIndex === 0"
          @click="changeResponse(-1)"
        />
        <AppButton
          variant="link"
          :icon="faArrowRight"
          :disabled="responseIndex === responses.length - 1"
          @click="changeResponse(1)"
        />
      </AppButtonGroup>

      <i18n-t keypath="callout.entryOf" tag="span">
        <template #no>
          <b>{{ n(responseIndex + 1) }}</b>
        </template>
        <template #total>
          <b>{{ n(responses.length) }}</b>
        </template>
      </i18n-t>
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
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'change', responseNumber: number): void;
}>();
const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseViewSchema'>;
  responses: GetCalloutResponseMapData[];
}>();

const { n } = useI18n();

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
