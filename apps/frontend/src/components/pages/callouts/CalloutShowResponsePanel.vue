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
import { computed } from 'vue';

import CalloutSidePanel from './CalloutSidePanel.vue';
import {
  type GetCalloutDataWith,
  type GetCalloutResponseMapData,
} from '@beabee/beabee-common';
import CalloutResponse from './CalloutResponse.vue';
import AppButton from '@components/button/AppButton.vue';
import AppButtonGroup from '@components/button/AppButtonGroup.vue';
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

const responseIndex = computed(() =>
  props.responses.findIndex((r) => r.number === currentResponseNumber.value)
);
const currentResponse = computed(() => props.responses[responseIndex.value]);

function changeResponse(inc: number) {
  const newIndex = responseIndex.value + inc;
  currentResponseNumber.value = props.responses[newIndex].number;
}
</script>
