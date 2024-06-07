<template>
  <span v-if="readonly">
    <component
      :is="selectedFilterGroup.custom || AppSearchRuleFilterGroup"
      v-if="selectedFilterGroup"
      :filter-group="selectedFilterGroup"
      :rule="rule"
      readonly
      @remove="emit('remove')"
    />
  </span>
  <div v-else>
    <div v-if="filterGroups.length > 1" class="-mx-2 mb-2">
      <AppToggle v-model="selectedFilterGroupId" :items="filterGroups" />
    </div>

    <component
      :is="selectedFilterGroup.custom || AppSearchRuleFilterGroup"
      v-if="selectedFilterGroup"
      :filter-group="selectedFilterGroup"
      :rule="rule"
      @update:rule="emit('update:rule', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watchEffect } from 'vue';
import AppSearchRuleFilterGroup from './AppSearchRuleFilterGroup.vue';
import AppToggle from '@components/forms/AppToggle.vue';
import type { SearchRuleProps, SearchRuleEmits } from './search.interface';

const emit = defineEmits<SearchRuleEmits>();
const props = defineProps<SearchRuleProps>();

const selectedFilterGroupId = ref('');

const selectedFilterGroup = computed(() => {
  return props.filterGroups.find((g) => g.id === selectedFilterGroupId.value);
});

// Select the group of the current rule, or the first group
watchEffect(() => {
  let groupId = props.filterGroups[0].id;

  if (props.rule) {
    for (const group of props.filterGroups) {
      if (
        group.items[props.rule.field] ||
        group.itemsMatch?.test(props.rule.field)
      ) {
        groupId = group.id;
        break;
      }
    }
  }

  selectedFilterGroupId.value = groupId;
});
</script>
