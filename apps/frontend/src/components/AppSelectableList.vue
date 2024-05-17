<template>
  <ul>
    <li
      v-for="item in items"
      :key="item.id"
      class="flex items-center justify-between gap-4 px-3 py-2"
      :class="
        selectedByItemId[item.id] ? 'bg-primary-10' : 'hover:bg-primary-5'
      "
      @click="$emit('click', item, selectedByItemId[item.id])"
    >
      <span><slot :item="item" /></span>
      <font-awesome-icon v-if="selectedByItemId[item.id]" :icon="faCheck" />
    </li>
  </ul>
</template>
<script lang="ts" setup generic="Item extends { id: string }">
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';

defineEmits<{ (event: 'click', item: Item, selected: boolean): void }>();

const props = defineProps<{
  items: Item[];
  selectedItemIds?: string[];
}>();

const selectedByItemId = computed(() =>
  props.selectedItemIds
    ? Object.fromEntries(props.selectedItemIds.map((id) => [id, true]))
    : {}
);
</script>
