<script lang="ts" setup>
import { ref, reactive } from 'vue';
import AppRadioGroup from './AppRadioGroup.vue';

const state = reactive({
  selectedOption: 'option1',
  options: [
    ['option1', 'Option 1'],
    ['option2', 'Option 2'],
    ['option3', 'Option 3'],
  ] as [string, string][],
  variant: 'link' as const,
  disabled: false,
  label: 'Select an option',
  inline: false,
  required: false,
});

const variants = ['primary', 'link', 'danger'] as const;

// Example radio state for different use cases
const selectedGender = ref('male');
const selectedPlan = ref('standard');
const selectedContact = ref('email');
</script>

<template>
  <Story title="Components/Form/AppRadioGroup">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <AppRadioGroup
          v-model="state.selectedOption"
          :options="state.options"
          :variant="state.variant"
          :disabled="state.disabled"
          :label="state.label"
          :inline="state.inline"
          :required="state.required"
        />

        <div class="text-sm text-grey-dark">
          <p>Current selection: {{ state.selectedOption }}</p>
        </div>
      </div>

      <template #controls>
        <HstSelect
          v-model="state.selectedOption"
          title="Selected Option"
          :options="state.options.map(([value]) => value)"
        />
        <HstSelect
          v-model="state.variant"
          title="Variant"
          :options="variants"
        />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstCheckbox v-model="state.inline" title="Inline" />
        <HstCheckbox v-model="state.required" title="Required" />
        <HstText v-model="state.label" title="Label" />
      </template>
    </Variant>

    <Variant title="Variants">
      <div class="flex max-w-md flex-col gap-4">
        <div
          v-for="variant in variants"
          :key="variant"
          class="rounded border p-4"
        >
          <AppRadioGroup
            v-model="state.selectedOption"
            :options="state.options"
            :variant="variant"
            :label="`${variant} variant radio group`"
          />
        </div>
      </div>
    </Variant>

    <Variant title="States">
      <div class="flex max-w-md flex-col gap-4">
        <div class="rounded border p-4">
          <AppRadioGroup
            v-model="state.selectedOption"
            :options="state.options"
            label="Standard radio group"
          />
        </div>
        <div class="rounded border p-4">
          <AppRadioGroup
            v-model="state.selectedOption"
            :options="state.options"
            disabled
            label="Disabled radio group"
          />
        </div>
        <div class="rounded border p-4">
          <AppRadioGroup
            v-model="state.selectedOption"
            :options="state.options"
            required
            label="Required radio group"
          />
        </div>
        <div class="rounded border p-4">
          <AppRadioGroup
            v-model="state.selectedOption"
            :options="state.options"
            inline
            label="Inline radio group"
          />
        </div>
      </div>
    </Variant>

    <Variant title="Example Use Cases">
      <div class="flex max-w-md flex-col gap-8">
        <div class="rounded border p-4">
          <AppRadioGroup
            v-model="selectedGender"
            :options="[
              ['male', 'Male'],
              ['female', 'Female'],
              ['other', 'Other'],
              ['prefer-not', 'Prefer not to say'],
            ]"
            label="Gender"
            variant="primary"
          />
        </div>

        <div class="rounded border p-4">
          <AppRadioGroup
            v-model="selectedPlan"
            :options="[
              ['free', 'Free Plan'],
              ['standard', 'Standard Plan'],
              ['premium', 'Premium Plan'],
            ]"
            label="Subscription Plan"
            variant="link"
            required
          />
        </div>

        <div class="rounded border p-4">
          <AppRadioGroup
            v-model="selectedContact"
            :options="[
              ['email', 'Email'],
              ['phone', 'Phone'],
              ['mail', 'Mail'],
            ]"
            label="Preferred Contact Method"
            variant="danger"
            inline
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
