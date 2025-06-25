<script lang="ts" setup>
import { reactive, ref } from 'vue';

import AppChoice from './AppChoice.vue';

const state = reactive({
  selectedValue: 'option1',
  items: [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ],
  size: 'sm' as const,
  disabled: false,
});

const sizes = ['xs', 'sm'] as const;

// Different example use cases
const selectedAmount = ref(5);
const amountItems = [
  { label: '€5', value: 5 },
  { label: '€10', value: 10 },
  { label: '€25', value: 25 },
  { label: '€50', value: 50 },
];

const selectedPeriod = ref('monthly');
const periodItems = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

const selectedFrequency = ref(1);
const frequencyItems = [
  { label: 'Daily', value: 1 },
  { label: 'Weekly', value: 7 },
  { label: 'Monthly', value: 30 },
];
</script>

<template>
  <Story title="Form/AppChoice">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <AppChoice
          v-model="state.selectedValue"
          :items="state.items"
          :size="state.size"
          :disabled="state.disabled"
        />

        <div class="text-sm text-grey-dark">
          <p>Current selection: {{ state.selectedValue }}</p>
        </div>
      </div>

      <template #controls>
        <HstSelect
          v-model="state.selectedValue"
          title="Selected Value"
          :options="state.items.map((item) => item.value)"
        />
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>

    <Variant title="Sizes">
      <div class="flex max-w-md flex-col gap-6">
        <div class="rounded border p-4">
          <h3 class="mb-2 text-sm font-semibold">Small (sm)</h3>
          <AppChoice
            v-model="state.selectedValue"
            :items="state.items"
            size="sm"
          />
        </div>
        <div class="rounded border p-4">
          <h3 class="mb-2 text-sm font-semibold">Extra Small (xs)</h3>
          <AppChoice
            v-model="state.selectedValue"
            :items="state.items"
            size="xs"
          />
        </div>
      </div>
    </Variant>

    <Variant title="States">
      <div class="flex max-w-md flex-col gap-6">
        <div class="rounded border p-4">
          <h3 class="mb-2 text-sm font-semibold">Standard</h3>
          <AppChoice v-model="state.selectedValue" :items="state.items" />
        </div>
        <div class="rounded border p-4">
          <h3 class="mb-2 text-sm font-semibold">Disabled</h3>
          <AppChoice
            v-model="state.selectedValue"
            :items="state.items"
            disabled
          />
        </div>
      </div>
    </Variant>

    <Variant title="Example Use Cases">
      <div class="flex max-w-md flex-col gap-8">
        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">Contribution Amount</h3>
          <AppChoice v-model="selectedAmount" :items="amountItems" size="xs" />
          <p class="mt-2 text-xs text-grey-dark">
            Selected: €{{ selectedAmount }}
          </p>
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">Payment Period</h3>
          <AppChoice v-model="selectedPeriod" :items="periodItems" />
          <p class="mt-2 text-xs text-grey-dark">
            Selected: {{ selectedPeriod }}
          </p>
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">Frequency (Days)</h3>
          <AppChoice
            v-model="selectedFrequency"
            :items="frequencyItems"
            size="xs"
          />
          <p class="mt-2 text-xs text-grey-dark">
            Selected: Every {{ selectedFrequency }} day(s)
          </p>
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">Long Options</h3>
          <AppChoice
            v-model="state.selectedValue"
            :items="[
              { label: 'Short Option', value: 'short' },
              { label: 'Medium Length Option', value: 'medium' },
              { label: 'Very Long Option Name That Might Wrap', value: 'long' },
            ]"
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
