<script lang="ts" setup>
import { reactive } from 'vue';

import AppLabel from './AppLabel.vue';

const state = reactive({
  label: 'Form Field Label',
  required: false,
});
</script>

<template>
  <Story title="Form/AppLabel">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <AppLabel :label="state.label" :required="state.required" />
      </div>

      <template #controls>
        <HstText v-model="state.label" title="Label" />
        <HstCheckbox v-model="state.required" title="Required" />
      </template>
    </Variant>

    <Variant title="Required">
      <div class="flex max-w-md flex-col gap-4">
        <AppLabel label="Required Field" required />
      </div>
    </Variant>

    <Variant title="Optional">
      <div class="flex max-w-md flex-col gap-4">
        <AppLabel label="Optional Field" />
      </div>
    </Variant>

    <Variant title="In Form Context">
      <div class="flex max-w-md flex-col gap-4">
        <div class="rounded border p-4">
          <AppLabel label="First Name" required />
          <input
            type="text"
            class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
          />
        </div>

        <div class="rounded border p-4">
          <AppLabel label="Last Name" />
          <input
            type="text"
            class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
