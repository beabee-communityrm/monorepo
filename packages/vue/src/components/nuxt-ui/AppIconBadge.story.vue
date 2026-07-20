<script lang="ts" setup>
import { reactive } from 'vue';

import AppIconBadge from './AppIconBadge.vue';

const state = reactive({
  icon: 'i-lucide-shield-check',
  color: 'primary' as 'primary' | 'neutral' | 'error',
});
</script>

<template>
  <Story title="NuxtUi/AppIconBadge">
    <Variant title="Playground" :init-state="() => state">
      <template #default="{ state }">
        <AppIconBadge :icon="state.icon" :color="state.color" />
      </template>

      <template #controls="{ state }">
        <HstText v-model="state.icon" title="Icon" />
        <HstSelect
          v-model="state.color"
          title="Color"
          :options="['primary', 'neutral', 'error']"
        />
      </template>
    </Variant>

    <Variant title="Colors">
      <div class="flex gap-3">
        <AppIconBadge icon="i-lucide-shield-check" color="primary" />
        <AppIconBadge icon="i-lucide-info" color="neutral" />
        <AppIconBadge icon="i-lucide-shield-off" color="error" />
      </div>
    </Variant>
  </Story>
</template>
