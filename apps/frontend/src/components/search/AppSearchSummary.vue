<template>
  <ul class="flex flex-wrap items-center gap-2 text-sm text-body-80">
    <template v-for="(rule, i) in modelValue.rules" :key="i">
      <li class="rounded-full border border-primary-70 bg-primary-10 px-2 py-1">
        <AppSearchRuleOrGroup
          :filter-groups="filterGroups"
          :rule="rule"
          readonly
          @remove="handleRemove(i)"
        />
      </li>
      <li class="font-bold uppercase last:hidden">
        {{ t('advancedSearch.matchWord.' + modelValue.condition) }}
      </li>
    </template>
  </ul>
</template>
<script lang="ts" setup>
import type { RuleGroup } from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';
import AppSearchRuleOrGroup from './AppSearchRuleOrGroup.vue';

import type { FilterGroups } from '@type';

const emit = defineEmits<(e: 'update:modelValue', value: RuleGroup) => void>();
const props = defineProps<{
  modelValue: RuleGroup;
  filterGroups: FilterGroups;
}>();

const { t } = useI18n();

function handleRemove(i: number) {
  emit('update:modelValue', {
    condition: props.modelValue.condition,
    rules: props.modelValue.rules.filter((_, index) => index !== i),
  });
}
</script>
