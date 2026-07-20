<script lang="ts" setup>
import { reactive } from 'vue';

import AppModalActions from './AppModalActions.vue';

const state = reactive({
  cancelLabel: 'Back',
  confirmLabel: 'Save',
  confirmColor: 'primary' as 'primary' | 'error',
  confirmDisabled: false,
  confirmLoading: false,
});
</script>

<template>
  <Story title="NuxtUi/AppModalActions">
    <Variant title="Playground" :init-state="() => state">
      <template #default="{ state }">
        <AppModalActions
          :cancel-label="state.cancelLabel"
          :confirm-label="state.confirmLabel"
          :confirm-color="state.confirmColor"
          :confirm-disabled="state.confirmDisabled"
          :confirm-loading="state.confirmLoading"
        />
      </template>

      <template #controls="{ state }">
        <HstText v-model="state.cancelLabel" title="Cancel label" />
        <HstText v-model="state.confirmLabel" title="Confirm label" />
        <HstSelect
          v-model="state.confirmColor"
          title="Confirm color"
          :options="['primary', 'error']"
        />
        <HstCheckbox v-model="state.confirmDisabled" title="Confirm disabled" />
        <HstCheckbox v-model="state.confirmLoading" title="Confirm loading" />
      </template>
    </Variant>

    <Variant title="Confirmation dialog">
      <AppModalActions
        cancel-label="Keep enabled"
        confirm-label="Remove"
        confirm-color="error"
      />
    </Variant>
  </Story>
</template>
