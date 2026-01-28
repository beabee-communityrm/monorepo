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
/**
 * Form component with validation, error handling, and notifications.
 *
 * Uses internal i18n for:
 * - Notification close button: notifications.remove
 * - Validation error message: form.errorMessages.validation
 * - Default success message: form.saved
 * - Default error messages: form.errorMessages.*
 *
 * @component AppForm
 */
import useVuelidate from '@vuelidate/core';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { addNotification } from '../../store/notifications';
import { AppButton } from '../button';
import { AppNotification } from '../notification';

const { t } = useI18n();

export interface AppFormProps {
  /** The text of the submit button */
  buttonText: string;
  /** The text of the reset button */
  resetButtonText?: string;
  /** Custom success message */
  successText?: string;
  /** Whether to show the error notification inline */
  inlineError?: boolean;
  /** Whether to use the full width of the button */
  fullButton?: boolean;
  /** The function to call when the form is submitted */
  onSubmit?: (evt: Event) => Promise<void | false> | void | false;
  /** Function to extract error text from error object */
  extractErrorText?: (error: unknown) => string;
}

const emit = defineEmits(['reset']);
const props = defineProps<AppFormProps>();

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
    const errorText =
      props.extractErrorText?.(err) || t('form.errorMessages.generic');
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
