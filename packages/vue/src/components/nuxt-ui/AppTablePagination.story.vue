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
        />
      </template>

      <template #controls="{ state }">
        <HstNumber v-model="state.total" title="Total" />
      </template>
    </Variant>

    <Variant title="Fixed page size">
      <AppTablePagination v-model:page="listPage" :total="36" :page-size="10" />
    </Variant>

    <Variant title="Empty">
      <AppTablePagination :page="0" :total="0" />
    </Variant>
  </Story>
</template>
