<script lang="ts" setup>
import { reactive } from 'vue';

import AppSelectAllBanner from './AppSelectAllBanner.vue';

const state = reactive({
  mode: 'explicit' as 'explicit' | 'all',
  selectedCount: 25,
  total: 240,
});
</script>

<template>
  <Story title="NuxtUi/AppSelectAllBanner">
    <Variant title="Playground" :init-state="() => state">
      <template #default="{ state }">
        <AppSelectAllBanner
          :mode="state.mode"
          :selected-count="state.selectedCount"
          :total="state.total"
          @select-all="
            state.mode = 'all';
            state.selectedCount = state.total;
          "
          @clear="
            state.mode = 'explicit';
            state.selectedCount = 25;
          "
        />
      </template>

      <template #controls="{ state }">
        <HstSelect
          v-model="state.mode"
          title="Mode"
          :options="['explicit', 'all']"
        />
        <HstNumber v-model="state.selectedCount" title="Selected" />
        <HstNumber v-model="state.total" title="Total" />
      </template>
    </Variant>

    <Variant title="Page selected">
      <AppSelectAllBanner mode="explicit" :selected-count="25" :total="240" />
    </Variant>

    <Variant title="All selected">
      <AppSelectAllBanner mode="all" :selected-count="240" :total="240" />
    </Variant>

    <Variant title="All selected, some deselected">
      <AppSelectAllBanner mode="all" :selected-count="237" :total="240" />
    </Variant>
  </Story>
</template>
