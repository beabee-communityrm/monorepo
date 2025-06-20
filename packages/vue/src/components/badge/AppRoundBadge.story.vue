<script lang="ts" setup>
import AppRoundBadge from './AppRoundBadge.vue';
</script>

<template>
  <Story title="Badge/AppRoundBadge" :layout="{ type: 'grid', width: 'auto' }">
    <Variant title="Status Types" icon="carbon:status">
      <div class="flex gap-4">
        <div class="flex items-center gap-2">
          <AppRoundBadge type="success" />
          <span class="text-sm">Success</span>
        </div>
        <div class="flex items-center gap-2">
          <AppRoundBadge type="warning" />
          <span class="text-sm">Warning</span>
        </div>
        <div class="flex items-center gap-2">
          <AppRoundBadge type="danger" />
          <span class="text-sm">Danger</span>
        </div>
      </div>
    </Variant>

    <Variant title="Size Variants" icon="carbon:resize">
      <div class="flex gap-4">
        <div class="flex items-center gap-2">
          <AppRoundBadge type="success" size="large" />
          <span class="text-sm">Large</span>
        </div>
        <div class="flex items-center gap-2">
          <AppRoundBadge type="success" size="small" />
          <span class="text-sm">Small</span>
        </div>
      </div>
    </Variant>

    <Variant title="Interactive Controls" icon="carbon:settings">
      <template #controls>
        <HstSelect
          v-model="state.type"
          title="Type"
          :options="[
            { value: 'success', label: 'Success' },
            { value: 'warning', label: 'Warning' },
            { value: 'danger', label: 'Danger' },
          ]"
        />
        <HstSelect
          v-model="state.size"
          title="Size"
          :options="[
            { value: 'large', label: 'Large' },
            { value: 'small', label: 'Small' },
          ]"
        />
      </template>

      <div class="flex items-center gap-2">
        <AppRoundBadge :type="state.type" :size="state.size" />
        <span class="text-sm">{{ state.type }} ({{ state.size }})</span>
      </div>
    </Variant>

    <Variant title="In List Context" icon="carbon:list">
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <AppRoundBadge type="success" />
          <span>Task completed successfully</span>
        </div>
        <div class="flex items-center gap-3">
          <AppRoundBadge type="warning" />
          <span>Review required</span>
        </div>
        <div class="flex items-center gap-3">
          <AppRoundBadge type="danger" />
          <span>Action needed</span>
        </div>
      </div>
    </Variant>
  </Story>
</template>

<script lang="ts">
export default {
  data() {
    return {
      state: {
        type: 'success' as 'success' | 'warning' | 'danger',
        size: 'large' as 'large' | 'small',
      },
    };
  },
};
</script>
