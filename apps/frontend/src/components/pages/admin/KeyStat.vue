<template>
  <div
    class="flex flex-1 flex-col flex-col-reverse justify-between border-l border-primary-40 pl-2 text-body-80"
  >
    <p class="text-sm font-semibold">{{ label }}</p>
    <p class="mb-3 text-3xl font-bold">{{ stat }}</p>
  </div>
</template>
<script lang="ts" setup>
defineProps<{
  label: string;
  stat: string;
}>();
</script>
