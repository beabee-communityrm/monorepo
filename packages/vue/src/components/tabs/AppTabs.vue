<template>
  <ul class="mb-4 flex border-b border-primary-40 text-sm md:mb-6 xl:text-base">
    <li v-for="item in items" :key="item.id">
      <router-link
        :to="item.to"
        class="relative inline-block p-2"
        :class="
          selected === item.id && 'border-text border-b-2 font-bold text-body'
        "
      >
        <span class="text-body-80 hover:text-body">
          {{ item.label }}
          <span v-if="item.count !== undefined" class="ml-1">
            ({{ item.count }})
          </span>
        </span>
      </router-link>
    </li>
  </ul>
</template>
<script lang="ts" setup>
import type { TabItem } from './tabs.interface';

defineProps<{
  items: TabItem[];
  selected: string | null;
}>();
</script>
