<script lang="ts" setup>
import { addNotification } from '@beabee/vue/store/notifications';

import { reactive, ref } from 'vue';

import AppAsyncButton from './AppAsyncButton.vue';
import type { ButtonColor, ButtonVariant } from './AppButton.vue';

const colors: ButtonColor[] = ['primary', 'link', 'danger', 'neutral'];
const variants: ButtonVariant[] = ['solid', 'outline', 'ghost', 'link'];

const icons: Record<string, string | undefined> = {
  none: undefined,
  eye: 'fa6-solid:eye',
  save: 'fa6-solid:floppy-disk',
  upload: 'fa6-solid:upload',
  check: 'fa6-solid:check',
};

const state = reactive({
  color: colors[0] as ButtonColor,
  variant: variants[0] as ButtonVariant,
  icon: undefined as string | undefined,
  text: 'Submit',
  delay: 1000,
  shouldFail: false,
});

const successCount = ref(0);
const failureCount = ref(0);

// Simulate an async operation
async function simulateAsyncOperation(shouldFail = false, delay = 1000) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        failureCount.value++;
        reject(new Error('Operation failed'));
      } else {
        successCount.value++;
        resolve();
      }
    }, delay);
  });
}

async function handleSuccess() {
  await simulateAsyncOperation(false, state.delay);
  addNotification({
    title: 'Operation completed successfully',
    variant: 'success',
  });
}

async function handleFailure() {
  await simulateAsyncOperation(true, state.delay);
  // Error notification is handled by the component
}

async function handleClick() {
  await simulateAsyncOperation(state.shouldFail, state.delay);
  if (!state.shouldFail) {
    addNotification({
      title: 'Operation completed successfully',
      variant: 'success',
    });
  }
}
</script>

<template>
  <Story title="Button/AppAsyncButton">
    <Variant title="Playground">
      <div class="flex flex-col gap-4">
        <AppAsyncButton
          :variant="state.variant"
          :icon="state.icon"
          :onClick="handleClick"
        >
          {{ state.text }}
        </AppAsyncButton>

        <div class="text-sm text-grey-dark">
          <p>Success count: {{ successCount }}</p>
          <p>Failure count: {{ failureCount }}</p>
        </div>
      </div>

      <template #controls>
        <HstText v-model="state.text" title="Button Text" />
        <HstSelect
          v-model="state.variant"
          title="Variant"
          :options="variants"
        />
        <HstSelect
          v-model="state.icon"
          title="Icon"
          :options="
            Object.entries(icons).map(([key, value]) => ({ label: key, value }))
          "
        />
        <HstNumber v-model="state.delay" title="Delay (ms)" />
        <HstCheckbox v-model="state.shouldFail" title="Should Fail" />
      </template>
    </Variant>

    <Variant title="With Icons">
      <div class="flex gap-4">
        <AppAsyncButton
          color="primary"
          variant="outline"
          icon="fa6-solid:eye"
          :onClick="() => simulateAsyncOperation(false, 1000)"
        >
          Preview
        </AppAsyncButton>
        <AppAsyncButton
          color="primary"
          variant="outline"
          icon="fa6-solid:floppy-disk"
          :onClick="() => simulateAsyncOperation(false, 1000)"
        >
          Save Draft
        </AppAsyncButton>
        <AppAsyncButton
          color="primary"
          variant="solid"
          icon="fa6-solid:upload"
          :onClick="() => simulateAsyncOperation(false, 1000)"
        >
          Publish
        </AppAsyncButton>
      </div>
    </Variant>
  </Story>
</template>
