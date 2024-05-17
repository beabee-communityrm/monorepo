<template>
  <form @submit.prevent="handleSubmit">
    <slot />

    <AppNotification
      v-if="validation.$errors.length > 0"
      variant="error"
      :title="t('form.errorMessages.validation')"
      class="mb-4"
    />

    <AppNotification
      v-if="inlineErrorText"
      variant="error"
      :title="inlineErrorText"
      class="mb-4"
    />

    <div class="flex gap-2">
      <AppButton
        type="submit"
        variant="link"
        :loading="isLoading"
        :disabled="validation.$invalid"
        :class="fullButton ? 'w-full' : ''"
      >
        {{ buttonText }}
      </AppButton>
      <AppButton v-if="resetButtonText" variant="text" @click="emit('reset')">
        {{ resetButtonText }}
      </AppButton>
      <slot name="buttons" :disabled="validation.$invalid" />
    </div>
  </form>
</template>
<script lang="ts" setup>
import useVuelidate from '@vuelidate/core';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { addNotification } from '../../store/notifications';
import { isRequestError } from '../../utils/api';
import AppNotification from '../AppNotification.vue';
import AppButton from '../button/AppButton.vue';
import { LOGIN_CODES } from '@enums/login-codes';

const emit = defineEmits(['reset']);
const props = defineProps<{
  buttonText: string;
  resetButtonText?: string;
  successText?: string;
  errorText?: Record<string, string>;
  inlineError?: boolean;
  fullButton?: boolean;
  onSubmit?: (evt: Event) => Promise<void | false> | void | false;
}>();

const { t } = useI18n();

const errorMessages = computed<Record<string, string>>(() => ({
  unknown: t('form.errorMessages.generic'),
  'duplicate-email': t('form.errorMessages.api.duplicate-email'),
  [LOGIN_CODES.LOGIN_FAILED]: t('form.errorMessages.api.login-failed'),
  [LOGIN_CODES.INVALID_TOKEN]: t('form.errorMessages.api.invalid-token'),
  [LOGIN_CODES.LOCKED]: t('form.errorMessages.api.account-locked'),
  ...props.errorText,
}));

const isLoading = ref(false);
const inlineErrorText = ref('');

const validation = useVuelidate();

async function handleSubmit(evt: Event) {
  isLoading.value = true;
  inlineErrorText.value = '';

  try {
    const ret = await props.onSubmit?.(evt);
    if (ret !== false && props.successText) {
      addNotification({
        title: props.successText,
        variant: 'success',
      });
    }
  } catch (err) {
    const errorCode = isRequestError(err, undefined, [400, 401])
      ? err.response.data.code
      : 'unknown';
    const errorText =
      errorMessages.value[errorCode] || errorMessages.value.unknown;
    if (props.inlineError) {
      inlineErrorText.value = errorText;
    } else {
      addNotification({ title: errorText, variant: 'error' });
    }
  } finally {
    isLoading.value = false;
  }
}
</script>
