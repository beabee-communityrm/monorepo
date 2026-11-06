<script lang="ts" setup>
import { reactive } from 'vue';

import AppTablePagination from './AppTablePagination.vue';

const state = reactive({
  total: 240,
  page: 0,
  limit: 25,
});
</script>

<template>
  <Story title="NuxtUi/AppTablePagination">
    <Variant title="Playground" :init-state="() => state">
      <template #default="{ state }">
        <AppTablePagination
          v-model:page="state.page"
          v-model:limit="state.limit"
          :total="state.total"
        />
      </template>

      <template #controls="{ state }">
        <HstNumber v-model="state.total" title="Total" />
      </template>
    </Variant>
  </Story>
</template>
