<script lang="ts" setup>
import { ref } from 'vue';

import AppRadioInput from './AppRadioInput.vue';

const selection = ref('option1');
const variants = ['primary', 'link', 'danger'] as const;
</script>

<template>
  <Story title="Form/AppRadioInput">
    <Variant title="Basic">
      <div class="flex max-w-md flex-col gap-4">
        <div class="space-y-2">
          <AppRadioInput v-model="selection" name="basic-demo" value="option1">
            Option 1
          </AppRadioInput>
          <AppRadioInput v-model="selection" name="basic-demo" value="option2">
            Option 2
          </AppRadioInput>
          <AppRadioInput v-model="selection" name="basic-demo" value="option3">
            Option 3
          </AppRadioInput>
        </div>

        <div class="text-sm text-grey-dark">
          <p>Current selection: {{ selection }}</p>
        </div>
      </div>
    </Variant>

    <Variant title="Variants">
      <div class="flex max-w-md flex-col gap-4">
        <div
          v-for="variant in variants"
          :key="variant"
          class="rounded border p-4"
        >
          <h3 class="mb-2 font-semibold">{{ variant }} variant</h3>
          <div class="space-y-2">
            <AppRadioInput
              v-model="selection"
              :name="`${variant}-demo`"
              :value="`${variant}-1`"
              :variant="variant"
            >
              {{ variant }} option 1
            </AppRadioInput>
            <AppRadioInput
              v-model="selection"
              :name="`${variant}-demo`"
              :value="`${variant}-2`"
              :variant="variant"
            >
              {{ variant }} option 2
            </AppRadioInput>
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="States">
      <div class="flex max-w-md flex-col gap-4">
        <div class="rounded border p-4">
          <h3 class="mb-2 font-semibold">Standard</h3>
          <AppRadioInput
            v-model="selection"
            name="states-demo"
            value="standard"
          >
            Standard radio input
          </AppRadioInput>
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-2 font-semibold">Disabled</h3>
          <AppRadioInput
            v-model="selection"
            name="states-demo"
            value="disabled"
            disabled
          >
            Disabled radio input
          </AppRadioInput>
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-2 font-semibold">Required</h3>
          <AppRadioInput
            v-model="selection"
            name="states-demo"
            value="required"
            required
          >
            Required radio input
          </AppRadioInput>
        </div>
      </div>
    </Variant>
  </Story>
</template>
