<script lang="ts" setup>
import { addNotification } from '@beabee/vue/store/notifications';

import {
  faCheck,
  faEye,
  faSave,
  faSpinner,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { reactive, ref } from 'vue';

import AppAsyncButton from './AppAsyncButton.vue';
import type { ButtonVariant } from './AppButton.vue';

const variants: ButtonVariant[] = [
  'primary',
  'link',
  'danger',
  'primaryOutlined',
  'linkOutlined',
  'dangerOutlined',
  'greyOutlined',
  'text',
  'dangerText',
];

const icons = {
  none: undefined,
  eye: faEye,
  save: faSave,
  upload: faUpload,
  check: faCheck,
  spinner: faSpinner,
};

const state = reactive({
  variant: variants[0],
  icon: icons.none,
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
          variant="primaryOutlined"
          :icon="faEye"
          :onClick="() => simulateAsyncOperation(false, 1000)"
        >
          Preview
        </AppAsyncButton>
        <AppAsyncButton
          variant="primaryOutlined"
          :icon="faSave"
          :onClick="() => simulateAsyncOperation(false, 1000)"
        >
          Save Draft
        </AppAsyncButton>
        <AppAsyncButton
          variant="primary"
          :icon="faUpload"
          :onClick="() => simulateAsyncOperation(false, 1000)"
        >
          Publish
        </AppAsyncButton>
      </div>
    </Variant>
  </Story>
</template>
