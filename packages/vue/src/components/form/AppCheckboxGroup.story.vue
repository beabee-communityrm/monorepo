<script lang="ts" setup>
import { ref, reactive } from 'vue';
import AppCheckboxGroup from './AppCheckboxGroup.vue';
import type { SelectItem } from '../../types/form.interface';

type StringOption = SelectItem<string>;
type NumberOption = SelectItem<number>;

const stringOptions: StringOption[] = [
  { id: 'option1', label: 'Option 1' },
  { id: 'option2', label: 'Option 2' },
  { id: 'option3', label: 'Option 3' },
  { id: 'option4', label: 'Option 4' },
];

const numberOptions: NumberOption[] = [
  { id: 1, label: 'Item 1' },
  { id: 2, label: 'Item 2' },
  { id: 3, label: 'Item 3' },
];

const fruitOptions: StringOption[] = [
  { id: 'apple', label: 'Apple' },
  { id: 'banana', label: 'Banana' },
  { id: 'orange', label: 'Orange' },
  { id: 'strawberry', label: 'Strawberry' },
  { id: 'grape', label: 'Grape' },
];

const categoryOptions: StringOption[] = [
  { id: 'news', label: 'News' },
  { id: 'sports', label: 'Sports' },
  { id: 'tech', label: 'Technology' },
  { id: 'health', label: 'Health' },
  { id: 'entertainment', label: 'Entertainment' },
];

const communicationOptions: StringOption[] = [
  { id: 'email', label: 'Email Notifications' },
  { id: 'newsletter', label: 'Weekly Newsletter' },
  { id: 'updates', label: 'Product Updates' },
  { id: 'marketing', label: 'Marketing Communications' },
];

const agreementOptions: StringOption[] = [
  { id: 'terms', label: 'I accept the Terms of Service' },
  { id: 'privacy', label: 'I accept the Privacy Policy' },
  { id: 'marketing', label: 'I would like to receive marketing emails' },
];

const state = reactive({
  selectedOptions: ['option1'] as string[],
  options: stringOptions,
  label: 'Select options',
  inline: false,
  required: false,
});

// Example selections for different use cases
const selectedFruits = ref(['apple', 'banana'] as string[]);
const selectedCategories = ref(['news', 'tech'] as string[]);
const selectedCommunications = ref(['email'] as string[]);
const agreements = ref([] as string[]);
const selectedItems = ref([1, 3] as number[]);
</script>

<template>
  <Story title="Components/Form/AppCheckboxGroup">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <AppCheckboxGroup
          v-model="state.selectedOptions"
          :options="state.options"
          :label="state.label"
          :inline="state.inline"
          :required="state.required"
        />

        <div class="text-gray-500 text-sm">
          <p>Selected options: {{ state.selectedOptions.join(', ') }}</p>
        </div>
      </div>

      <template #controls>
        <HstCheckbox v-model="state.inline" title="Inline" />
        <HstCheckbox v-model="state.required" title="Required" />
        <HstText v-model="state.label" title="Label" />
      </template>
    </Variant>

    <Variant title="Basic Usage">
      <div class="flex max-w-md flex-col gap-8">
        <div class="rounded border p-4">
          <AppCheckboxGroup
            v-model="state.selectedOptions"
            :options="stringOptions"
            label="String options"
          />
        </div>

        <div class="rounded border p-4">
          <AppCheckboxGroup
            v-model="selectedItems"
            :options="numberOptions"
            label="Number options"
          />
        </div>
      </div>
    </Variant>

    <Variant title="Required Selection">
      <div class="flex max-w-md flex-col gap-4">
        <div class="rounded border p-4">
          <AppCheckboxGroup
            v-model="selectedCategories"
            :options="categoryOptions"
            label="Select at least one category"
            required
          />
        </div>
      </div>
    </Variant>

    <Variant title="Inline Layout">
      <div class="flex max-w-md flex-col gap-4">
        <div class="rounded border p-4">
          <AppCheckboxGroup
            v-model="selectedFruits"
            :options="fruitOptions.slice(0, 3)"
            label="Select fruits (inline)"
            inline
          />
        </div>
      </div>
    </Variant>

    <Variant title="Example Use Cases">
      <div class="flex max-w-md flex-col gap-8">
        <div class="rounded border p-4">
          <h3 class="mb-4 text-lg font-bold">Interests</h3>
          <AppCheckboxGroup
            v-model="selectedCategories"
            :options="categoryOptions"
            label="What topics are you interested in?"
            required
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-4 text-lg font-bold">Communication Preferences</h3>
          <AppCheckboxGroup
            v-model="selectedCommunications"
            :options="communicationOptions"
            label="How would you like to hear from us?"
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-4 text-lg font-bold">Terms and Agreements</h3>
          <AppCheckboxGroup
            v-model="agreements"
            :options="agreementOptions"
            label="Please review and accept the following"
            required
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
