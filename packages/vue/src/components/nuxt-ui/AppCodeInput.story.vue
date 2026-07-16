<script lang="ts" setup>
import { reactive } from 'vue';

import AppCodeInput from './AppCodeInput.vue';

const state = reactive({
  value: [] as string[],
  error: false,
});
</script>

<template>
  <Story title="NuxtUi/AppCodeInput">
    <Variant title="Playground" :init-state="() => state">
      <template #default="{ state }">
        <div class="max-w-sm">
          <AppCodeInput v-model="state.value" :error="state.error" />
        </div>
      </template>

      <template #controls="{ state }">
        <HstCheckbox v-model="state.error" title="Error" />
      </template>
    </Variant>

    <Variant title="Error state">
      <div class="max-w-sm">
        <AppCodeInput :model-value="[]" error />
      </div>
    </Variant>
  </Story>
</template>
