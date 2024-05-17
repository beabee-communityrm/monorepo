<template>
  <form :class="formClass" @submit.prevent>
    <FormRenderer
      v-for="slide in visibleSlides"
      :key="slide.id"
      v-model="answersProxy[slide.id]"
      :components="slide.components"
      :component-i18n-text="callout.formSchema.componentText"
      :readonly="readonly"
    />

    <template v-if="isLastSlide && !readonly && !preview">
      <CalloutFormGuestFields
        v-if="showGuestFields"
        v-model:name="guestName"
        v-model:email="guestEmail"
      />

      <CalloutFormCaptcha v-if="showCaptcha" v-model="captchaToken" />

      <AppNotification
        v-if="formError"
        class="mb-4"
        variant="error"
        :title="formError"
      />
      <AppButton
        type="submit"
        class="mb-4 w-full"
        variant="primary"
        :disabled="validation.$invalid"
        :loading="isLoading"
        @click="handleSubmit"
      >
        {{ currentSlide.navigation.submitText }}
      </AppButton>
    </template>
    <div v-if="totalSlides > 1" class="flex justify-between gap-4">
      <div>
        <AppButton
          v-if="currentSlide.navigation.prevText && slideIds.length > 1"
          type="button"
          variant="primaryOutlined"
          @click="handlePrevSlide"
        >
          {{ currentSlide.navigation.prevText }}
        </AppButton>
      </div>
      <div>
        <AppButton
          v-if="currentSlideNo < totalSlides - 1"
          type="button"
          variant="primary"
          :disabled="validation.$invalid"
          @click="handleNextSlide"
        >
          {{ currentSlide.navigation.nextText }}
        </AppButton>
      </div>
    </div>
  </form>
</template>

<script lang="ts" setup>
import type { CalloutResponseAnswers } from '@beabee/beabee-common';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import useVuelidate from '@vuelidate/core';

import CalloutFormGuestFields from './CalloutFormGuestFields.vue';
import AppNotification from '@components/AppNotification.vue';
import FormRenderer from '@components/form-renderer/FormRenderer.vue';
import AppButton from '@components/button/AppButton.vue';

import { currentUser } from '@store';

import { createResponse } from '@utils/api/callout';
import { isRequestError } from '@utils/api';
import { getDecisionComponent } from '@utils/callouts';

import type { GetCalloutDataWith } from '@type';
import CalloutFormCaptcha from './CalloutFormCaptcha.vue';
import { requiredIf } from '@vuelidate/validators';

const { t } = useI18n();

const emit = defineEmits<{ (e: 'submitted'): void }>();
const props = defineProps<{
  callout: GetCalloutDataWith<'form'>;
  answers?: CalloutResponseAnswers;
  preview?: boolean;
  readonly?: boolean;
  style?: 'simple' | 'small';
  noBg?: boolean;
  allSlides?: boolean;
  onSubmit?(answers: CalloutResponseAnswers): void;
}>();

const guestName = ref('');
const guestEmail = ref('');
const captchaToken = ref('');
const formError = ref('');
const isLoading = ref(false);

const formClass = computed(() => [
  'callout-form',
  {
    'is-simple': props.style === 'simple',
    'is-small': props.style === 'small',
    'has-bg': !props.noBg,
  },
]);

const slides = computed(() => props.callout.formSchema.slides);

const initialAnswers = Object.fromEntries(
  slides.value.map((slide) => [slide.id, props.answers?.[slide.id] || {}])
);

const answersProxy = ref<CalloutResponseAnswers>(initialAnswers);

const slideIds = ref<string[]>([slides.value[0].id]);

const currentSlide = computed(
  () => slides.value.find((s) => s.id === slideIds.value[0])! // Should always be defined
);

const visibleSlides = computed(() =>
  props.allSlides ? slides.value : [currentSlide.value]
);

const currentSlideNo = computed(() => slides.value.indexOf(currentSlide.value));

const totalSlides = computed(() => (props.allSlides ? 1 : slides.value.length));
const isLastSlide = computed(
  () => currentSlideNo.value === totalSlides.value - 1
);

const showGuestFields = computed(
  () => props.callout.access === 'guest' && !currentUser.value
);

const showCaptcha = computed(
  () =>
    props.callout.captcha === 'all' ||
    (props.callout.captcha === 'guest' && !currentUser.value)
);

const rules = computed(() => ({
  captchaToken: {
    required: requiredIf(showCaptcha.value && isLastSlide.value),
  },
}));

const validation = useVuelidate(rules, { captchaToken });

async function handleSubmit() {
  // Only submit answers for slides in the current flow
  // The user might have visited other flows then gone back
  const validAnswers: CalloutResponseAnswers = {};
  for (const slideId of slideIds.value) {
    validAnswers[slideId] = answersProxy.value[slideId];
  }

  if (props.onSubmit) {
    return props.onSubmit(validAnswers);
  }

  formError.value = '';
  isLoading.value = true;
  try {
    await createResponse(
      props.callout.slug,
      {
        ...(!currentUser.value &&
          props.callout?.access === 'guest' && {
            guestName: guestName.value,
            guestEmail: guestEmail.value,
          }),
        answers: validAnswers,
      },
      captchaToken.value
    );
    emit('submitted');
  } catch (err) {
    formError.value = t('callout.form.submittingResponseError');
    if (!isRequestError(err)) throw err;
  } finally {
    isLoading.value = false;
  }
}

function handleNextSlide() {
  let nextSlideId;

  // If there is a decision component check if the user has selected a value
  const decisionComponent = getDecisionComponent(currentSlide.value.components);
  if (decisionComponent) {
    const answers = answersProxy.value[currentSlide.value.id];
    const value = answers
      ? answers[decisionComponent.key as keyof typeof answers]
      : undefined;

    nextSlideId = decisionComponent.values.find((v) => v.value === value)
      ?.nextSlideId;
  }

  // Otherwise use the next slide ID from the navigation
  if (!nextSlideId) {
    nextSlideId =
      currentSlide.value.navigation.nextSlideId ||
      slides.value[currentSlideNo.value + 1].id;
  }

  slideIds.value.unshift(nextSlideId);
}

function handlePrevSlide() {
  slideIds.value.shift();
}
</script>
