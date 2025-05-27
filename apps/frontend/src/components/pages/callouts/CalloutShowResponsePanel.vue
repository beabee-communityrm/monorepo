<template>
  <CalloutSidePanel :show="!!currentResponse" @close="$emit('close')">
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

    <CalloutResponse
      v-if="currentResponse"
      :callout="callout"
      :response="currentResponse"
    />
  </CalloutSidePanel>
</template>

<script lang="ts" setup>
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { computed, watch } from 'vue';

import CalloutSidePanel from './CalloutSidePanel.vue';
import {
  type GetCalloutDataWith,
  type GetCalloutResponseMapData,
} from '@beabee/beabee-common';
import CalloutResponse from './CalloutResponse.vue';
import { AppButton, AppButtonGroup } from '@beabee/vue/components';
import { useI18n } from 'vue-i18n';

defineEmits<{ (e: 'close'): void }>();
const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseViewSchema'>;
  responses: GetCalloutResponseMapData[];
}>();

const currentResponseNumber = defineModel<number>('currentResponseNumber', {
  default: 0,
});

const { n } = useI18n();

const responseIndex = computed(() => {
  const index = props.responses.findIndex(
    (r) => r.number === currentResponseNumber.value
  );
  // If no response found with the current number, default to first response
  return index >= 0 ? index : 0;
});

const currentResponse = computed(() => props.responses[responseIndex.value]);

// Watch for changes in responses and set the current response number to the first response
watch(
  () => props.responses,
  (newResponses) => {
    if (
      newResponses.length > 0 &&
      (currentResponseNumber.value === 0 ||
        !newResponses.find((r) => r.number === currentResponseNumber.value))
    ) {
      currentResponseNumber.value = newResponses[0].number;
    }
  },
  { immediate: true }
);

function changeResponse(inc: number) {
  const newIndex = responseIndex.value + inc;
  currentResponseNumber.value = props.responses[newIndex].number;
}
</script>
