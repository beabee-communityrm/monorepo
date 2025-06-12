<script lang="ts" setup>
import {
  faExclamationTriangle,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { reactive } from 'vue';

import AppNotification from './AppNotification.vue';

const state = reactive({
  title: 'Notification Title',
  description: 'Additional description for screen readers',
  variant: 'info' as const,
  mode: 'normal' as const,
  removeable: true,
  showIcon: false,
  visible: true,
});

const variants = ['success', 'warning', 'error', 'info'] as const;
const modes = ['normal', 'inline'] as const;
const removeableOptions = [true, false, 'auto'] as const;

function handleRemove() {
  state.visible = false;
  setTimeout(() => {
    state.visible = true;
  }, 1500);
}
</script>

<template>
  <Story title="Components/Notification/AppNotification">
    <Variant title="Playground">
      <div v-if="state.visible" class="flex max-w-md flex-col gap-4">
        <AppNotification
          :title="state.title"
          :description="state.description"
          :variant="state.variant"
          :mode="state.mode"
          :removeable="state.removeable"
          :icon="
            state.showIcon
              ? state.variant === 'info'
                ? faInfoCircle
                : faExclamationTriangle
              : undefined
          "
          @remove="handleRemove"
        >
          <div v-if="state.mode === 'normal'">
            <p>This is the content of the notification.</p>
            <p>
              It can contain <strong>formatted text</strong> and
              <a href="#" class="text-link">links</a>.
            </p>
          </div>
        </AppNotification>
      </div>

      <template #controls>
        <HstText v-model="state.title" title="Title" />
        <HstText
          v-model="state.description"
          title="Description (for screen readers)"
        />
        <HstSelect
          v-model="state.variant"
          title="Variant"
          :options="variants"
        />
        <HstSelect v-model="state.mode" title="Mode" :options="modes" />
        <HstSelect
          v-model="state.removeable"
          title="Removeable"
          :options="[
            { label: 'True', value: true },
            { label: 'False', value: false },
            { label: 'Auto', value: 'auto' },
          ]"
        />
        <HstCheckbox v-model="state.showIcon" title="Show Icon" />
      </template>
    </Variant>

    <Variant title="Success">
      <div class="flex max-w-md flex-col gap-4">
        <AppNotification title="Operation Successful" variant="success">
          <p>Your changes have been saved successfully.</p>
        </AppNotification>
      </div>
    </Variant>

    <Variant title="Warning">
      <div class="flex max-w-md flex-col gap-4">
        <AppNotification title="Warning" variant="warning">
          <p>This action will log you out of all devices.</p>
        </AppNotification>
      </div>
    </Variant>

    <Variant title="Error">
      <div class="flex max-w-md flex-col gap-4">
        <AppNotification title="Error" variant="error">
          <p>There was a problem processing your request.</p>
        </AppNotification>
      </div>
    </Variant>

    <Variant title="Info">
      <div class="flex max-w-md flex-col gap-4">
        <AppNotification title="Information" variant="info">
          <p>Your account will be updated in the next 24 hours.</p>
        </AppNotification>
      </div>
    </Variant>

    <Variant title="With Icon">
      <div class="flex max-w-md flex-col gap-4">
        <AppNotification
          title="Information"
          variant="info"
          :icon="faInfoCircle"
        >
          <p>This notification includes an icon.</p>
        </AppNotification>
      </div>
    </Variant>

    <Variant title="Inline Mode">
      <div class="flex max-w-md flex-col gap-4">
        <AppNotification
          title="Form validation failed"
          variant="error"
          mode="inline"
        />
      </div>
    </Variant>

    <Variant title="Auto-Remove">
      <div class="flex max-w-md flex-col gap-4">
        <AppNotification
          title="This will disappear automatically"
          variant="info"
          removeable="auto"
          @remove="handleRemove"
        />
      </div>
    </Variant>

    <Variant title="Not Removeable">
      <div class="flex max-w-md flex-col gap-4">
        <AppNotification
          title="Important Information"
          variant="warning"
          :removeable="false"
        >
          <p>This notification cannot be dismissed.</p>
        </AppNotification>
      </div>
    </Variant>
  </Story>
</template>
