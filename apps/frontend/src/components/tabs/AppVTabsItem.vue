<template>
  <a
    :href="item.to"
    class="group flex items-baseline justify-between rounded p-2 text-sm xl:text-base"
    :class="selected && 'bg-white font-semibold'"
    @click.prevent="emit('click', item.id)"
  >
    <span
      :class="selected ? 'text-link' : 'text-body-80 group-hover:text-body'"
      >{{ item.label }}</span
    >
    <span
      v-if="item.count !== undefined"
      class="ml-2 text-xs font-semibold"
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
