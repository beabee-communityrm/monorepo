<script lang="ts" setup>
import { reactive } from 'vue';

import { addNotification, useNotifications } from '../../store/notifications';
import AppNotificationContainer from './AppNotificationContainer.vue';

const { notifications } = useNotifications();

const state = reactive({
  removeAriaLabel: 'Close notification',
});

function addSampleNotification(
  variant: 'success' | 'warning' | 'error' | 'info'
) {
  const messages = {
    success: 'Operation completed successfully!',
    warning: 'Please review your settings.',
    error: 'Something went wrong. Please try again.',
    info: 'New features are now available.',
  };

  addNotification({
    title: `${variant.charAt(0).toUpperCase() + variant.slice(1)} notification`,
    description: messages[variant],
    variant,
    removeable: 'auto',
  });
}

function addPersistentNotification() {
  addNotification({
    title: 'Important Information',
    description: 'This notification requires manual dismissal.',
    variant: 'warning',
    removeable: true,
  });
}

function clearAllNotifications() {
  notifications.splice(0, notifications.length);
}
</script>

<template>
  <Story title="Notification/AppNotificationContainer">
    <Variant title="Playground">
      <div class="relative h-96 w-full overflow-hidden rounded bg-grey-lighter">
        <AppNotificationContainer :remove-aria-label="state.removeAriaLabel" />

        <!-- Control area -->
        <div class="absolute left-4 top-4 space-y-2">
          <h3 class="font-bold">Add Notifications:</h3>
          <div class="flex flex-col gap-2">
            <button
              class="rounded bg-success px-3 py-1 text-white"
              @click="addSampleNotification('success')"
            >
              Add Success
            </button>
            <button
              class="rounded bg-warning px-3 py-1 text-white"
              @click="addSampleNotification('warning')"
            >
              Add Warning
            </button>
            <button
              class="rounded bg-danger px-3 py-1 text-white"
              @click="addSampleNotification('error')"
            >
              Add Error
            </button>
            <button
              class="rounded bg-primary px-3 py-1 text-white"
              @click="addSampleNotification('info')"
            >
              Add Info
            </button>
            <button
              class="rounded bg-body px-3 py-1 text-white"
              @click="addPersistentNotification"
            >
              Add Persistent
            </button>
            <button
              class="rounded bg-grey-dark px-3 py-1 text-white"
              @click="clearAllNotifications"
            >
              Clear All
            </button>
          </div>

          <div class="mt-4">
            <p class="text-sm text-grey-dark">
              Active notifications: {{ notifications.length }}
            </p>
          </div>
        </div>
      </div>

      <template #controls>
        <HstText
          v-model="state.removeAriaLabel"
          title="Remove Button Aria Label"
        />
      </template>
    </Variant>

    <Variant title="With Auto-dismiss">
      <div class="relative h-96 w-full overflow-hidden rounded bg-grey-lighter">
        <AppNotificationContainer />

        <div class="absolute left-4 top-4">
          <button
            class="rounded bg-primary px-4 py-2 text-white"
            @click="addSampleNotification('info')"
          >
            Add Auto-dismiss Notification
          </button>
        </div>
      </div>
    </Variant>

    <Variant title="Multiple Notifications">
      <div class="relative h-96 w-full overflow-hidden rounded bg-grey-lighter">
        <AppNotificationContainer />

        <div class="absolute left-4 top-4">
          <button
            class="rounded bg-primary px-4 py-2 text-white"
            @click="
              () => {
                addSampleNotification('success');
                addSampleNotification('warning');
                addSampleNotification('error');
              }
            "
          >
            Add Multiple Notifications
          </button>
        </div>
      </div>
    </Variant>
  </Story>
</template>
