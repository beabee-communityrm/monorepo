<template>
  <template v-for="(item, i) in items" :key="item.id">
    <button
      class="mx-2 rounded p-2 text-sm font-bold text-primary-80"
      :class="{ 'bg-primary-20': modelValue === item.id }"
      @click="$emit('update:modelValue', item.id)"
    >
      {{ item.label }}
    </button>
    <span v-if="i < items.length - 1">&bull;</span>
  </template>
</template>
<script lang="ts" setup>
defineEmits(['update:modelValue']);
defineProps<{
  modelValue: string;
  items: {
    id: string;
    label: string;
  }[];
}>();
</script>
