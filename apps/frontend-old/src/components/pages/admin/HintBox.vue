<template>
  <div
    class="mb-4 flex-1 rounded-xl border-2 border-white p-8 text-center"
    v-html="hint"
  />
</template>
<script lang="ts" setup>
defineProps<{ hint: string }>();
</script>
