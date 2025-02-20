<template>
  <div class="mb-6 max-w-3xl">
    <AppLabel v-if="title" :label="title" class="mb-3" />
    <AppNotification v-if="notification" v-bind="notification" />
    <div class="rounded bg-white p-4">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppLabel from './AppLabel.vue';
import AppNotification, {
  type AppNotificationProps,
} from '@components/AppNotification.vue';

/**
 * Props for the AppFormBox component
 */
export interface AppFormBoxProps {
  /** The title of the form box */
  title?: string;
  /** The notification to display in the form box */
  notification?: AppNotificationProps;
}

defineProps<AppFormBoxProps>();
</script>
