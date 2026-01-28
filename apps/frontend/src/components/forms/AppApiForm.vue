<!--
  A wrapper around AppForm that automatically handles errors that come from the
  beabee API
-->
<template>
  <AppForm v-bind="$props" :extract-error-text="extractErrorText">
    <slot />
  </AppForm>
</template>

<script setup lang="ts">
import { isApiError } from '@beabee/client';
import { AppForm, type AppFormProps } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface AppApiFormProps extends Omit<AppFormProps, 'extractErrorText'> {
  /** Custom error messages for API error codes */
  errorText?: Record<string, string>;
}

const { t } = useI18n();

const props = defineProps<AppApiFormProps>();

const errorMessages = computed<Record<string, string>>(() => ({
  unknown: t('form.errorMessages.generic'),
  'account-locked': t('form.errorMessages.api.account-locked'),
  'duplicate-email': t('form.errorMessages.api.duplicate-email'),
  'duplicate-tag-name': t('form.errorMessages.api.duplicate-tag-name'),
  'invalid-token': t('form.errorMessages.api.invalid-token'),
  'login-failed': t('form.errorMessages.api.login-failed'),
  'mfa-token-required': t('form.errorMessages.api.mfa-token-required'),
  ...props.errorText,
}));

/**
 * Extract a nice error text from an API error
 *
 * @param error The error object to extract code from
 * @returns The translated error message for known errors or a generic one for
 * unknown errors
 */
function extractErrorText(error: unknown): string {
  return isApiError(error) && errorMessages.value[error.code]
    ? errorMessages.value[error.code]
    : errorMessages.value.unknown;
}
</script>
