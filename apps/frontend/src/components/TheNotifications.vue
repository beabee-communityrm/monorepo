<template>
  <div class="fixed bottom-16 left-16 z-50 w-96">
    <div class="flex flex-col gap-4">
      <transition-group name="notification">
        <AppNotfication
          v-for="notification in notifications"
          :key="notification.id"
          :title="notification.title"
          :variant="notification.variant"
          class="shadow-lg"
          removeable="auto"
          @remove="removeItem(notification.id)"
        />
      </transition-group>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppNotfication from './AppNotification.vue';
import { notifications } from '../store/notifications';

function removeItem(id: number) {
  notifications.splice(
    notifications.findIndex((n) => n.id === id),
    1
  );
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
