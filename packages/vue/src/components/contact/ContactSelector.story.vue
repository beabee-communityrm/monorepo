<script lang="ts" setup>
import { reactive } from 'vue';

import { AppLabel } from '../form';
import { ContactSelector } from './index';

const state = reactive({
  selectedId: '',
  label: 'Preview as contact',
  selfOptionLabel: 'Myself',
  countTemplate: 'Contact %current% of %total%',
  previousAriaLabel: 'Previous',
  nextAriaLabel: 'Next',
});

const optionsSelfOnly = [{ id: '' }];

const optionsWithContacts = [
  { id: '', firstname: '', lastname: '', email: '' },
  { id: '1', firstname: 'Jane', lastname: 'Doe', email: 'jane@example.com' },
  { id: '2', firstname: 'John', lastname: 'Smith', email: 'john@example.com' },
];
</script>

<template>
  <Story title="Contact/ContactSelector">
    <Variant title="Self only (both buttons disabled)">
      <div class="max-w-md">
        <AppLabel :label="state.label" class="mb-2 block" />
        <ContactSelector
          v-model="state.selectedId"
          :options="optionsSelfOnly"
          :name-aria-label="state.label"
          :self-option-label="state.selfOptionLabel"
          :count-template="state.countTemplate"
          :previous-aria-label="state.previousAriaLabel"
          :next-aria-label="state.nextAriaLabel"
        />
      </div>
    </Variant>

    <Variant title="Self + contacts">
      <div class="max-w-md">
        <AppLabel :label="state.label" class="mb-2 block" />
        <ContactSelector
          v-model="state.selectedId"
          :options="optionsWithContacts"
          :name-aria-label="state.label"
          :self-option-label="state.selfOptionLabel"
          :count-template="state.countTemplate"
          :previous-aria-label="state.previousAriaLabel"
          :next-aria-label="state.nextAriaLabel"
        />
      </div>
    </Variant>
  </Story>
</template>
