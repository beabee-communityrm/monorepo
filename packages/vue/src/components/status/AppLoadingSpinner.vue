<!--
  # AppLoadingSpinner
  Inline loading indicator (spinner + optional message). Matches AppStatusPage / design system.
  Control visibility via v-if on the instance (e.g. <AppLoadingSpinner v-if="loading" />).

  ## Props
  - `message` (string): Optional text next to the spinner (e.g. "Loading...").
  - `inverted` (boolean): When true, use light color (e.g. on dark overlays). Default false.
-->
<template>
  <div
    class="flex items-center"
    :class="inverted ? 'text-white' : 'text-body-80'"
  >
    <font-awesome-icon
      :icon="faCircleNotch"
      class="mr-2 h-6 w-6 shrink-0 animate-spin"
      :class="inverted ? 'text-white' : 'text-primary'"
      spin
      aria-hidden="true"
    />
    <span v-if="message">{{ message }}</span>
  </div>
</template>

<script lang="ts" setup>
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

export interface AppLoadingSpinnerProps {
  /** Optional text next to the spinner (e.g. "Loading..."). */
  message?: string;
  /** When true, use light color for dark backgrounds (e.g. overlays). */
  inverted?: boolean;
}

withDefaults(defineProps<AppLoadingSpinnerProps>(), {
  message: '',
  inverted: false,
});
</script>
