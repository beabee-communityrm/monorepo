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
import {
  CalloutAccess,
  CalloutCaptcha,
  type CalloutResponseAnswersSlide,
  type GetCalloutDataWith,
} from '@beabee/beabee-common';
import { AppButton, AppNotification } from '@beabee/vue';

import FormRenderer from '@components/form-renderer/FormRenderer.vue';
import AppNewsletterOptIn from '@components/newsletter/AppNewsletterOptIn.vue';
import { currentUser } from '@store';
import { client, isApiError } from '@utils/api';
import { getDecisionComponent } from '@utils/callouts';
import useVuelidate from '@vuelidate/core';
import { requiredIf } from '@vuelidate/validators';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

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
  props.allSlides ? slides.value : [currentSlide.value]
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
    if (!isApiError(err)) throw err;
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

    nextSlideId = decisionComponent.values.find(
      (v) => v.value === value
    )?.nextSlideId;
  }

  // Otherwise use the next slide ID from the navigation
  if (!nextSlideId) {
    nextSlideId =
      currentSlide.value.navigation.nextSlideId ||
      slides.value[currentSlideNo.value + 1].id;
  }

  slideIds.value.unshift(nextSlideId);

  formEl.value?.scrollIntoView();
}

function handlePrevSlide() {
  slideIds.value.shift();
}
</script>
