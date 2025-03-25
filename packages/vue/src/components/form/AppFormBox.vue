<template>
  <div class="mb-6">
    <p v-if="help" class="mb-2 text-sm text-grey-dark" v-html="help" />
    <AppLabel v-if="title" :label="title" class="mb-3 px-4" />
    <AppNotification v-if="notification" v-bind="notification" class="mb-3" />
    <div class="rounded bg-white p-4">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppLabel from './AppLabel.vue';
import AppNotification, {
  type AppNotificationProps,
} from '../notification/AppNotification.vue';

/**
 * Props for the AppFormBox component
 */
export interface AppFormBoxProps {
  /** The title of the form box */
  title?: string;
  /** The notification to display in the form box */
  notification?: AppNotificationProps;
  /** Help text displayed above the label */
  help?: string;
}

defineProps<AppFormBoxProps>();
</script>
