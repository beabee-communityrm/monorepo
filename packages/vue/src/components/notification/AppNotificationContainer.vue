<template>
  <div role="region" aria-label="Notifications">
    <div class="flex flex-col gap-4">
      <transition-group name="notification">
        <AppNotification
          v-for="notification in notifications"
          :id="notification.id"
          :key="notification.id"
          :title="notification.title"
          :description="notification.description"
          :variant="notification.variant"
          :removeable="notification.removeable"
          class="shadow-lg"
          @remove="removeItem(notification.id)"
        />
      </transition-group>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * Container component for displaying notifications with positioning and transitions.
 * Handles notification positioning, transitions, and removal functionality.
 *
 * @component AppNotificationContainer
 */
import { useI18n } from 'vue-i18n';

import { useNotifications } from '../../store/notifications';
import AppNotification from './AppNotification.vue';

defineProps();

const { t } = useI18n();
const { notifications, removeNotification } = useNotifications();

/**
 * Removes a notification by ID
 */
function removeItem(id: number) {
  removeNotification(id);
}
</script>

<style lang="postcss" scoped>
.notification-move,
.notification-enter-active,
.notification-leave-active {
  @apply transition;
}

.notification-leave-active {
  @apply absolute w-full;
}
.notification-enter-from,
.notification-leave-to {
  @apply translate-y-6 opacity-0;
}
</style>
