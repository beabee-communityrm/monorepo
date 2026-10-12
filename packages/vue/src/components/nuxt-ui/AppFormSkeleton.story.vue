<script lang="ts" setup>
import { reactive } from 'vue';

import AppSectionCard from './AppSectionCard.vue';
import AppFormSkeleton from './AppFormSkeleton.vue';

const state = reactive({
  rows: 3,
});
</script>

<template>
  <Story title="NuxtUi/AppFormSkeleton">
    <Variant title="Playground" :init-state="() => state">
      <template #default="{ state }">
        <div class="max-w-lg">
          <AppFormSkeleton :rows="state.rows" />
        </div>
      </template>

      <template #controls="{ state }">
        <HstNumber v-model="state.rows" title="Rows" />
      </template>
    </Variant>

    <Variant title="Inside a form card (typical usage)">
      <div class="max-w-lg">
        <AppSectionCard icon="i-lucide-user-round" title="Contact information">
          <AppFormSkeleton :rows="3" />
        </AppSectionCard>
      </div>
    </Variant>
  </Story>
</template>
