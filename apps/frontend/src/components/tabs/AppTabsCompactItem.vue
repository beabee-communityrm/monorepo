<template>
  <a
    :href="item.to"
    class="flex items-baseline px-3 py-6 font-semibold"
    :class="selected && 'font-bold'"
    @click.prevent="emit('click', item.id)"
  >
    <span
      :class="selected ? 'text-link' : 'text-body-80 group-hover:text-body'"
      >{{ item.label }}</span
    >
    <span
      v-if="item.count !== undefined"
      class="ml-1 rounded-xl bg-white p-1 text-xs"
      :class="selected ? 'text-body' : 'text-body-60 group-hover:text-body-80'"
      >{{ item.count }}</span
    >
  </a>
</template>
<script lang="ts" setup>
import { type TabItem } from './tabs.interface';

const emit = defineEmits(['click']);

defineProps<{
  item: TabItem;
  selected: boolean;
}>();
</script>
