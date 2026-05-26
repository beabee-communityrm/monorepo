<script lang="ts" setup>
import { ref } from 'vue';

import { AppLabel } from '../form';
import { ContactSelector } from './index';

const selectedId = ref('');
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
        <AppLabel label="Preview as contact" class="mb-2 block" />
        <ContactSelector v-model="selectedId" :options="optionsSelfOnly" />
      </div>
    </Variant>

    <Variant title="Self + contacts">
      <div class="max-w-md">
        <AppLabel label="Preview as contact" class="mb-2 block" />
        <ContactSelector v-model="selectedId" :options="optionsWithContacts" />
      </div>
    </Variant>
  </Story>
</template>
