<template>
  <form ref="formEl" :class="formClass" @submit.prevent>
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
        v-model:firstname="guestData.firstname"
        v-model:lastname="guestData.lastname"
        v-model:email="guestData.email"
        :required="callout.access === CalloutAccess.Guest || nlData.optIn"
        class="mb-8"
      />

      <AppNewsletterOptIn
        v-if="
          callout.access !== CalloutAccess.OnlyAnonymous &&
          callout.newsletterSchema
        "
        v-model="nlData.optIn"
        v-model:opt-in-groups="nlData.groups"
        :title="callout.newsletterSchema.title"
        :text="callout.newsletterSchema.text"
        :opt-in="callout.newsletterSchema.optIn"
        :groups="callout.newsletterSchema.groups"
        class="mb-8"
      />

      <CalloutFormCaptcha
        v-if="showCaptcha"
        v-model="captchaToken"
        class="mb-8"
      />

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
        disabled-focusable
        :aria-describedby="validation.$invalid ? incompleteHintId : undefined"
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
          disabled-focusable
          :aria-describedby="validation.$invalid ? incompleteHintId : undefined"
          @click="handleNextSlide"
        >
          {{ currentSlide.navigation.nextText }}
        </AppButton>
      </div>
    </div>
    <p v-if="validation.$invalid" :id="incompleteHintId" class="sr-only">
      {{ t('callout.form.incomplete') }}
    </p>
  </form>
</template>

<script lang="ts" setup>
import {
  CalloutAccess,
  CalloutCaptcha,
  type CalloutResponseAnswersSlide,
  type GetCalloutDataWith,
} from '@beabee/beabee-common';
import { ApiError } from '@beabee/client';
import { AppButton, AppNotification } from '@beabee/vue';

import useVuelidate from '@vuelidate/core';
import { requiredIf } from '@vuelidate/validators';
import { computed, reactive, ref, useId } from 'vue';
import { useI18n } from 'vue-i18n';

import FormRenderer from '#components/form-renderer/FormRenderer.vue';
import AppNewsletterOptIn from '#components/newsletter/AppNewsletterOptIn.vue';
import { currentUser } from '#store';
import { client } from '#utils/api';
import { getNextSlideId, getVisibleSlides } from '#utils/callouts';

import CalloutFormCaptcha from './CalloutFormCaptcha.vue';
import CalloutFormGuestFields from './CalloutFormGuestFields.vue';

const { t } = useI18n();

const emit = defineEmits<{ (e: 'submitted'): void }>();
const props = defineProps<{
  callout: GetCalloutDataWith<'form'>;
  answers?: CalloutResponseAnswersSlide;
  preview?: boolean;
  readonly?: boolean;
  style?: 'simple' | 'small';
  noBg?: boolean;
  allSlides?: boolean;
  onSubmit?(answers: CalloutResponseAnswersSlide): void;
}>();

const guestData = reactive({
  firstname: '',
  lastname: '',
  email: '',
});

const nlData = reactive({ optIn: false, groups: [] as string[] });

const captchaToken = ref('');
const formError = ref('');
const isLoading = ref(false);

const formEl = ref<HTMLFormElement>();

// Explains why the next or submit button is unavailable. Without it the only
// thing a screen reader announces is that the button is dimmed.
const incompleteHintId = `callout-form-incomplete-${useId()}`;
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

const answersProxy = ref<CalloutResponseAnswersSlide>(initialAnswers);

const slideIds = ref<string[]>([slides.value[0].id]);

const currentSlide = computed(
  () => slides.value.find((s) => s.id === slideIds.value[0])! // Should always be defined
);

const visibleSlides = computed(() =>
  props.allSlides
    ? getVisibleSlides(slides.value, answersProxy.value)
    : [currentSlide.value]
);

const currentSlideNo = computed(() => slides.value.indexOf(currentSlide.value));

const totalSlides = computed(() => (props.allSlides ? 1 : slides.value.length));
const isLastSlide = computed(
  () => currentSlideNo.value === totalSlides.value - 1
);

const showGuestFields = computed(
  () =>
    props.callout.access !== CalloutAccess.OnlyAnonymous && !currentUser.value
);

const showCaptcha = computed(
  () =>
    props.callout.captcha === CalloutCaptcha.All ||
    (props.callout.captcha === CalloutCaptcha.Guest && !currentUser.value)
);

const rules = computed(() => ({
  captchaToken: {
    required: requiredIf(showCaptcha.value && isLastSlide.value),
  },
}));

const validation = useVuelidate(rules, { captchaToken });

async function handleSubmit() {
  if (!props.callout) return; // Can't submit without a callout being loaded

  // Only submit answers for slides in the current flow
  // The user might have visited other flows then gone back
  const validAnswers: CalloutResponseAnswersSlide = {};
  for (const slideId of slideIds.value) {
    validAnswers[slideId] = answersProxy.value[slideId];
  }

  if (props.onSubmit) {
    return props.onSubmit(validAnswers);
  }

  formError.value = '';
  isLoading.value = true;
  try {
    await client.callout.createResponse(
      props.callout.slug,
      {
        answers: validAnswers,
        ...(!currentUser.value &&
          guestData.email &&
          guestData.firstname &&
          guestData.lastname && {
            guest: guestData,
          }),
        ...(props.callout?.newsletterSchema &&
          nlData.optIn && { newsletter: nlData }),
      },
      captchaToken.value
    );
    emit('submitted');
  } catch (err) {
    formError.value = t('callout.form.submittingResponseError');
    if (!(err instanceof ApiError)) throw err;
  } finally {
    isLoading.value = false;
  }
}

function handleNextSlide() {
  const nextSlideId = getNextSlideId(
    slides.value,
    currentSlideNo.value,
    answersProxy.value
  );

  slideIds.value.unshift(nextSlideId);

  formEl.value?.scrollIntoView();
}

function handlePrevSlide() {
  slideIds.value.shift();
}
</script>
