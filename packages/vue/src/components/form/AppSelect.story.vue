<script lang="ts" setup>
import { reactive } from 'vue';

import AppSelect from './AppSelect.vue';

const state = reactive({
  selectedValue: 'option1',
  items: [
    { id: 'option1', label: 'Option 1' },
    { id: 'option2', label: 'Option 2' },
    { id: 'option3', label: 'Option 3' },
  ],
  label: 'Choose an option',
  searchable: true,
  required: false,
  disabled: false,
  description: '',
  infoMessage: '',
  placeholder: 'Select an option...',
});

const countryState = reactive({
  selectedCountry: 'us',
});

const colorState = reactive({
  selectedColor: '',
});
</script>

<template>
  <Story title="Form/AppSelect">
    <Variant title="Playground">
      <div class="max-w-md space-y-6">
        <AppSelect
          v-model="state.selectedValue"
          :items="state.items"
          :label="state.label"
          :searchable="state.searchable"
          :required="state.required"
          :disabled="state.disabled"
          :description="state.description"
          :info-message="state.infoMessage"
          :placeholder="state.placeholder"
        />
        <div class="text-sm text-grey-dark">
          <p>Selected value: {{ state.selectedValue }}</p>
        </div>
      </div>

      <template #controls>
        <HstText v-model="state.label" title="Label" />
        <HstText v-model="state.description" title="Description" />
        <HstText v-model="state.infoMessage" title="Info Message" />
        <HstText v-model="state.placeholder" title="Placeholder" />
        <HstCheckbox v-model="state.searchable" title="Searchable" />
        <HstCheckbox v-model="state.required" title="Required" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>

    <Variant title="Examples">
      <div class="max-w-md space-y-8">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Country Select</h3>
          <AppSelect
            v-model="countryState.selectedCountry"
            label="Country"
            :items="[
              { id: 'us', label: 'United States' },
              { id: 'uk', label: 'United Kingdom' },
              { id: 'ca', label: 'Canada' },
              { id: 'au', label: 'Australia' },
              { id: 'de', label: 'Germany' },
              { id: 'fr', label: 'France' },
            ]"
            searchable
            required
            info-message="Select your country of residence"
          />
        </div>

        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">
            Color Select (Not Required)
          </h3>
          <AppSelect
            v-model="colorState.selectedColor"
            label="Favorite Color"
            :items="[
              { id: 'red', label: 'Red' },
              { id: 'blue', label: 'Blue' },
              { id: 'green', label: 'Green' },
              { id: 'yellow', label: 'Yellow' },
              { id: 'purple', label: 'Purple' },
            ]"
            placeholder="Choose a color (optional)"
            description="This field is optional"
          />
        </div>

        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Disabled Select</h3>
          <AppSelect
            v-model="state.selectedValue"
            label="Disabled Select"
            :items="state.items"
            disabled
            info-message="This select is disabled"
          />
        </div>

        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Non-Searchable Select</h3>
          <AppSelect
            v-model="state.selectedValue"
            label="Priority Level"
            :items="[
              { id: 'low', label: 'Low Priority' },
              { id: 'medium', label: 'Medium Priority' },
              { id: 'high', label: 'High Priority' },
              { id: 'critical', label: 'Critical Priority' },
            ]"
            :searchable="false"
            required
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
