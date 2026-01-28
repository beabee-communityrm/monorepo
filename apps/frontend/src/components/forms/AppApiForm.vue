<!--
  A wrapper around AppForm that automatically handles errors that come from the
  beabee API
-->
<template>
  <AppForm
    v-bind="$props"
    :extract-error-text="(code) => extractErrorText(code, errorText)"
  >
    <slot />
  </AppForm>
</template>

<script setup lang="ts">
import { AppForm, type AppFormProps } from '@beabee/vue';

import { extractErrorText } from '@utils/api-error';

interface AppApiFormProps extends Omit<AppFormProps, 'extractErrorText'> {
  /** Custom error messages for API error codes */
  errorText?: Record<string, string>;
}

defineProps<AppApiFormProps>();
</script>
