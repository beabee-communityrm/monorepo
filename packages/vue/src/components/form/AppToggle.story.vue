<script lang="ts" setup>
import { reactive } from 'vue';

import AppToggle from './AppToggle.vue';

const state = reactive({
  selectedValue: 'option1',
  items: [
    { id: 'option1', label: 'Option 1' },
    { id: 'option2', label: 'Option 2' },
    { id: 'option3', label: 'Option 3' },
  ],
});

const viewModeState = reactive({
  selectedView: 'list',
});

const statusState = reactive({
  selectedStatus: 'active',
});
</script>

<template>
  <Story title="Components/Form/AppToggle">
    <Variant title="Playground">
      <div class="max-w-md space-y-6">
        <div>
          <AppToggle v-model="state.selectedValue" :items="state.items" />
        </div>
        <div class="text-sm text-grey-dark">
          <p>Selected value: {{ state.selectedValue }}</p>
        </div>
      </div>

      <template #controls>
        <HstSelect
          v-model="state.selectedValue"
          title="Selected Value"
          :options="state.items.map((item) => item.id)"
        />
      </template>
    </Variant>

    <Variant title="Examples">
      <div class="max-w-md space-y-8">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">View Mode Toggle</h3>
          <AppToggle
            v-model="viewModeState.selectedView"
            :items="[
              { id: 'list', label: 'List' },
              { id: 'grid', label: 'Grid' },
              { id: 'card', label: 'Card' },
            ]"
          />
          <p class="mt-2 text-sm text-grey-dark">
            Current view: {{ viewModeState.selectedView }}
          </p>
        </div>

        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Status Filter</h3>
          <AppToggle
            v-model="statusState.selectedStatus"
            :items="[
              { id: 'active', label: 'Active' },
              { id: 'inactive', label: 'Inactive' },
              { id: 'pending', label: 'Pending' },
            ]"
          />
          <p class="mt-2 text-sm text-grey-dark">
            Current status: {{ statusState.selectedStatus }}
          </p>
        </div>

        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Two Options</h3>
          <AppToggle
            v-model="state.selectedValue"
            :items="[
              { id: 'yes', label: 'Yes' },
              { id: 'no', label: 'No' },
            ]"
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
