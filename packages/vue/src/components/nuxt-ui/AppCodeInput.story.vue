<script lang="ts" setup>
import { reactive } from 'vue';

import AppCodeInput from './AppCodeInput.vue';

const state = reactive({
  value: [] as (number | undefined)[],
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
        <UFormField error="Invalid code, please try again">
          <AppCodeInput :model-value="[]" error />
        </UFormField>
      </div>
    </Variant>
  </Story>
</template>
