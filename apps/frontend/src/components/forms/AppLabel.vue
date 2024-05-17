<template>
  <label class="mb-0.5 block font-semibold">
    {{ label }} {{ required ? '*' : '' }}
  </label>
</template>
<script lang="ts" setup>
defineProps<{
  label: string;
  required?: boolean;
}>();
</script>
