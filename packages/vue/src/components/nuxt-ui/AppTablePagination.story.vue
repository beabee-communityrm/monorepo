<script lang="ts" setup>
import { reactive, ref } from 'vue';

import AppTablePagination from './AppTablePagination.vue';

const state = reactive({
  total: 240,
  page: 0,
  limit: 25,
});

const listPage = ref(0);
</script>

<template>
  <Story title="NuxtUi/AppTablePagination">
    <Variant title="Playground" :init-state="() => state">
      <template #default="{ state }">
        <AppTablePagination
          v-model:page="state.page"
          v-model:limit="state.limit"
          :total="state.total"
          :limit-options="[10, 25, 50, 100]"
        />
      </template>

      <template #controls="{ state }">
        <HstNumber v-model="state.total" title="Total" />
      </template>
    </Variant>

    <Variant title="Fixed page size">
      <AppTablePagination v-model:page="listPage" :total="12" :page-size="3" />
    </Variant>
  </Story>
</template>
