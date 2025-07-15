<script lang="ts" setup>
import { reactive, ref } from 'vue';

import { AppButton } from '../button';
import AppConfirmDialog from './AppConfirmDialog.vue';

const state = reactive({
  open: false,
  title: 'Confirm Action',
  confirm: 'Confirm',
  cancel: 'Cancel',
  variant: 'default' as 'default' | 'danger',
  disableConfirm: false,
  showCancel: true,
  asyncConfirm: false,
});

const variants = ['default', 'danger'] as const;

const confirmCount = ref(0);
const closeCount = ref(0);

function openDialog() {
  state.open = true;
}

function closeDialog() {
  state.open = false;
  closeCount.value++;
}

function handleConfirm() {
  confirmCount.value++;
  state.open = false;
}

async function handleAsyncConfirm() {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 2000));
  confirmCount.value++;
}
</script>

<template>
  <Story title="Dialog/AppConfirmDialog">
    <Variant title="Playground">
      <div class="flex flex-col gap-4">
        <div class="flex gap-2">
          <AppButton @click="openDialog">Open Confirm Dialog</AppButton>
          <div class="text-body-60">
            <p>Confirmed: {{ confirmCount }} times</p>
            <p>Closed: {{ closeCount }} times</p>
          </div>
        </div>

        <AppConfirmDialog
          :open="state.open"
          :title="state.title"
          :confirm="state.confirm"
          :cancel="state.showCancel ? state.cancel : undefined"
          :variant="state.variant === 'default' ? undefined : state.variant"
          :disable-confirm="state.disableConfirm"
          :on-confirm="state.asyncConfirm ? handleAsyncConfirm : undefined"
          @close="closeDialog"
          @confirm="handleConfirm"
        >
          <p>Are you sure you want to perform this action?</p>
          <p class="text-sm text-body-60">
            This action cannot be undone and will have permanent consequences.
          </p>
        </AppConfirmDialog>
      </div>

      <template #controls>
        <HstText v-model="state.title" title="Title" />
        <HstText v-model="state.confirm" title="Confirm Button Text" />
        <HstText v-model="state.cancel" title="Cancel Button Text" />
        <HstSelect
          v-model="state.variant"
          title="Variant"
          :options="variants"
        />

        <HstCheckbox v-model="state.showCancel" title="Show Cancel Button" />
        <HstCheckbox v-model="state.disableConfirm" title="Disable Confirm" />
        <HstCheckbox v-model="state.asyncConfirm" title="Async Confirm" />
      </template>
    </Variant>

    <Variant title="Variants">
      <div class="flex flex-col gap-4">
        <div class="flex gap-4">
          <AppButton
            @click="
              () => {
                state.variant = 'default';
                state.title = 'Confirm Action';
                openDialog();
              }
            "
          >
            Default Confirm Dialog
          </AppButton>
          <AppButton
            @click="
              () => {
                state.variant = 'danger';
                state.title = 'Delete Item';
                openDialog();
              }
            "
          >
            Danger Confirm Dialog
          </AppButton>
        </div>
      </div>

      <AppConfirmDialog
        :open="state.open"
        :title="state.title"
        :confirm="state.confirm"
        :cancel="state.cancel"
        :variant="state.variant === 'default' ? undefined : state.variant"
        @close="closeDialog"
        @confirm="handleConfirm"
      >
        <p>
          This demonstrates the {{ state.variant }} variant of the confirm
          dialog.
        </p>
        <p class="text-sm text-body-60">
          Choose between default and danger styling variants.
        </p>
      </AppConfirmDialog>
    </Variant>

    <Variant title="Delete Confirmation">
      <AppButton
        variant="danger"
        @click="
          () => {
            state.title = 'Delete Item';
            state.confirm = 'Delete';
            state.cancel = 'Cancel';
            state.variant = 'danger';
            openDialog();
          }
        "
      >
        Delete Item
      </AppButton>

      <AppConfirmDialog
        :open="state.open"
        :title="state.title"
        :confirm="state.confirm"
        :cancel="state.cancel"
        :variant="state.variant === 'default' ? undefined : state.variant"
        @close="closeDialog"
        @confirm="handleConfirm"
      >
        <div class="space-y-2">
          <p><strong>Item:</strong> Important Document.pdf</p>
          <p class="text-danger">
            Are you sure you want to delete this item? This action cannot be
            undone.
          </p>
        </div>
      </AppConfirmDialog>
    </Variant>

    <Variant title="Async Confirmation">
      <AppButton
        @click="
          () => {
            state.title = 'Save Changes';
            state.confirm = 'Save';
            state.cancel = 'Discard';
            state.variant = 'default';
            state.asyncConfirm = true;
            openDialog();
          }
        "
      >
        Save with Async Action
      </AppButton>

      <AppConfirmDialog
        :open="state.open"
        :title="state.title"
        :confirm="state.confirm"
        :cancel="state.cancel"
        :variant="state.variant === 'default' ? undefined : state.variant"
        :on-confirm="state.asyncConfirm ? handleAsyncConfirm : undefined"
        @close="closeDialog"
        @confirm="handleConfirm"
      >
        <p>Do you want to save your changes?</p>
        <p class="text-sm text-body-60">
          This demonstrates an async operation with loading state.
        </p>
      </AppConfirmDialog>
    </Variant>

    <Variant title="No Cancel Button">
      <AppButton
        @click="
          () => {
            state.title = 'Terms Agreement';
            state.confirm = 'I Agree';
            state.showCancel = false;
            openDialog();
          }
        "
      >
        Open Agreement Dialog
      </AppButton>

      <AppConfirmDialog
        :open="state.open"
        :title="state.title"
        :confirm="state.confirm"
        :cancel="state.showCancel ? state.cancel : undefined"
        :variant="state.variant === 'default' ? undefined : state.variant"
        @close="closeDialog"
        @confirm="handleConfirm"
      >
        <p>By clicking "I Agree", you accept our terms and conditions.</p>
        <p class="text-sm text-body-60">
          This demonstrates a dialog without a cancel button.
        </p>
      </AppConfirmDialog>
    </Variant>
  </Story>
</template>
