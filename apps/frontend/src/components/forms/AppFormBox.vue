<template>
  <div class="mb-6">
    <AppLabel v-if="title" :label="title" class="mb-2" />
    <div class="rounded bg-white p-4">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppLabel from './AppLabel.vue';

defineProps<{
  title?: string;
}>();
</script>
