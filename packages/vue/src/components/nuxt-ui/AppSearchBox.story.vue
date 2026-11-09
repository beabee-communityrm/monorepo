<script lang="ts" setup>
import { reactive } from 'vue';

import AppSearchBox from './AppSearchBox.vue';

const state = reactive({
  search: '',
  placeholder: 'Search contacts',
});
</script>

<template>
  <Story title="NuxtUi/AppSearchBox">
    <Variant title="Playground" :init-state="() => state">
      <template #default="{ state }">
        <AppSearchBox
          v-model="state.search"
          :placeholder="state.placeholder"
          class="w-64"
        />
        <p class="mt-2 text-sm text-muted">Applied: "{{ state.search }}"</p>
      </template>

      <template #controls="{ state }">
        <HstText v-model="state.placeholder" title="Placeholder" />
        <HstText v-model="state.search" title="Applied search" />
      </template>
    </Variant>
  </Story>
</template>
