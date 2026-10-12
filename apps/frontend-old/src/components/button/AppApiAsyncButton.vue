<!--
  A wrapper around AppAsyncButton that automatically handles errors that come from the
  beabee API
-->
<template>
  <AppAsyncButton
    v-bind="$props"
    :extract-error-text="(error) => extractErrorText(error, errorText)"
  >
    <slot />
  </AppAsyncButton>
</template>

<script setup lang="ts">
import { AppAsyncButton, type AppAsyncButtonProps } from '@beabee/vue';

import { extractErrorText } from '#utils/api-error';

interface AppApiAsyncButtonProps extends Omit<
  AppAsyncButtonProps,
  'extractErrorText'
> {
  /** Custom error messages for API error codes */
  errorText?: Record<string, string>;
}

defineProps<AppApiAsyncButtonProps>();
</script>
