<template>
  <div
    class="fixed bottom-16 left-16 z-50 w-96"
    role="region"
    aria-label="Notifications"
  >
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
 * Container component for displaying notifications
 * Handles notification positioning and removal
 */

import AppNotification from '@beabee/vue/components/notification/AppNotification';
import { notifications } from '@beabee/vue';

function removeItem(id: number) {
  const index = notifications.findIndex((n) => n.id === id);
  if (index !== -1) {
    notifications.splice(index, 1);
  }
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
