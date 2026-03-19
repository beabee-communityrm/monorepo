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
        <div class="absolute bottom-4 left-4 flex flex-wrap gap-2">
          <button
            class="rounded bg-success-70 px-3 py-1 font-semibold text-white shadow-sm"
            @click="addTestNotification('success')"
          >
            Add Success
          </button>
          <button
            class="rounded bg-warning-70 px-3 py-1 font-semibold text-white shadow-sm"
            @click="addTestNotification('warning')"
          >
            Add Warning
          </button>
          <button
            class="rounded bg-danger-70 px-3 py-1 font-semibold text-white shadow-sm"
            @click="addTestNotification('error')"
          >
            Add Error
          </button>
          <button
            class="rounded bg-primary-70 px-3 py-1 font-semibold text-white shadow-sm"
            @click="addTestNotification('info')"
          >
            Add Info
          </button>
        </div>
      </div>
    </Variant>
  </Story>
</template>
