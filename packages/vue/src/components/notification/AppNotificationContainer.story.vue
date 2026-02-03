<script setup lang="ts">
import { reactive } from 'vue';

import { addNotification, useNotifications } from '../../store/notifications';
import AppNotificationContainer from './AppNotificationContainer.vue';

const { notifications } = useNotifications();

// State is kept for potential future controls but removeAriaLabel is no longer used
const state = reactive({});

const addTestNotification = (
  variant: 'success' | 'warning' | 'error' | 'info'
) => {
  addNotification({
    title: `${variant.charAt(0).toUpperCase() + variant.slice(1)} Notification`,
    description: `This is a ${variant} notification for testing.`,
    variant,
    removeable: 'auto',
  });
};
</script>

<template>
  <Story
    title="AppNotificationContainer"
    :layout="{ type: 'single', iframe: false }"
  >
    <Variant title="Playground">
      <div class="relative h-96 w-full overflow-hidden rounded bg-grey-lighter">
        <AppNotificationContainer />

        <!-- Control area -->
        <div class="absolute left-4 top-4 space-y-2">
          <button
            class="bg-green-500 rounded px-3 py-1 text-white"
            @click="addTestNotification('success')"
          >
            Add Success
          </button>
          <button
            class="bg-yellow-500 rounded px-3 py-1 text-white"
            @click="addTestNotification('warning')"
          >
            Add Warning
          </button>
          <button
            class="bg-red-500 rounded px-3 py-1 text-white"
            @click="addTestNotification('error')"
          >
            Add Error
          </button>
          <button
            class="bg-blue-500 rounded px-3 py-1 text-white"
            @click="addTestNotification('info')"
          >
            Add Info
          </button>
        </div>
      </div>
    </Variant>
  </Story>
</template>
