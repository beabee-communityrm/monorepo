<template>
  <div>
    <AppStepper v-model="selectedStepIndex" :steps="stepsInOrder" />
    <component
      :is="step.component"
      v-for="step in stepsInOrder"
      v-show="selectedStep === step"
      :key="step.name"
      v-model:data="step.data"
      v-model:validated="step.validated"
      v-model:error="step.error"
      :is-active="selectedStep === step"
      :status="status"
      :steps="steps"
    />
  </div>
</template>

<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import { ref, computed, markRaw, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import AppStepper from '../../../stepper/AppStepper.vue';
import type { CalloutStepsProps, CalloutSteps } from './callouts.interface';

import StepSettings from './steps/SettingsStep.vue';
import StepTitleAndImage from './steps/TitleAndImage.vue';
import StepEndMessage from './steps/EndMessage.vue';
// import StepMailchimpSync from './steps/MailchimpSync.vue';
import StepDatesAndDuration from './steps/DatesAndDuration.vue';
import StepContent from './steps/ContentStep.vue';

const props = defineProps<{
  stepsProps: CalloutStepsProps;
  status: ItemStatus | undefined;
}>();

const { t } = useI18n();

const steps = reactive<CalloutSteps>({
  content: {
    name: t('createCallout.steps.content.title'),
    validated: false,
    error: false,
    component: markRaw(StepContent),
    data: props.stepsProps.content,
  },
  titleAndImage: {
    name: t('createCallout.steps.titleAndImage.title'),
    validated: false,
    error: false,
    component: markRaw(StepTitleAndImage),
    data: props.stepsProps.titleAndImage,
  },
  settings: {
    name: t('createCallout.steps.settings.title'),
    validated: false,
    error: false,
    component: markRaw(StepSettings),
    data: props.stepsProps.settings,
  },
  endMessage: {
    name: t('createCallout.steps.endMessage.title'),
    validated: false,
    error: false,
    component: markRaw(StepEndMessage),
    data: props.stepsProps.endMessage,
  },
  /*mailchimp: {
    name: t('createCallout.steps.mailchimp.title'),
    validated: !props.status,
    error: false,
    component: markRaw(StepMailchimpSync),
  },*/
  dates: {
    name: t('createCallout.steps.dates.title'),
    validated: false,
    error: false,
    component: markRaw(StepDatesAndDuration),
    data: props.stepsProps.dates,
  },
});

const stepsInOrder = [
  steps.content,
  steps.titleAndImage,
  steps.endMessage,
  steps.settings,
  //steps.mailchimp,
  steps.dates,
];
const selectedStepIndex = ref(0);
const selectedStep = computed(() => stepsInOrder[selectedStepIndex.value]);
</script>
