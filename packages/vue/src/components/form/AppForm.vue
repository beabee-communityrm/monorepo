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
import { LOGIN_CODES } from '@beabee/beabee-common';
import { isApiError } from '@beabee/client';

import useVuelidate from '@vuelidate/core';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { addNotification } from '../../store/notifications';
import { AppButton } from '../button';
import { AppNotification } from '../notification';

export interface AppFormProps {
  /** The text of the submit button */
  buttonText: string;
  /** The text of the reset button */
  resetButtonText?: string;
  /** The text of the success notification */
  successText?: string;
  /** The text of the error notification */
  errorText?: Record<string, string>;
  /** Whether to show the error notification inline */
  inlineError?: boolean;
  /** Whether to use the full width of the button */
  fullButton?: boolean;
  /** The function to call when the form is submitted */
  onSubmit?: (evt: Event) => Promise<void | false> | void | false;
}

const emit = defineEmits(['reset']);
const props = defineProps<AppFormProps>();

const { t } = useI18n();

const errorMessages = computed<Record<string, string>>(() => ({
  unknown: t('form.errorMessages.generic'),
  'duplicate-email': t('form.errorMessages.api.duplicate-email'),
  [LOGIN_CODES.LOGIN_FAILED]: t('form.errorMessages.api.login-failed'),
  [LOGIN_CODES.INVALID_TOKEN]: t('form.errorMessages.api.invalid-token'),
  [LOGIN_CODES.LOCKED]: t('form.errorMessages.api.account-locked'),
  'duplicate-tag-name': t('form.errorMessages.api.duplicate-tag-name'),
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
    const errorCode = isApiError(err, undefined, [400, 401])
      ? err.code
      : 'unknown';
    const errorText =
      errorCode && errorMessages.value[errorCode]
        ? errorMessages.value[errorCode]
        : errorMessages.value.unknown;
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
