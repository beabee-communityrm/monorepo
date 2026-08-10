<!--
  # ContactFilterPanel
  Builds the rule group used to filter contacts.

  Rules are added by picking a field, so every rule starts out complete; there
  are no empty rule rows. Nested rule groups can't be edited here, matching the
  behaviour of the previous search form.
-->
<template>
  <div class="border-default bg-elevated/40 border-b p-4">
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <span class="text-muted">
        {{ t('advancedSearch.createFiltersBefore-nuxt') }}
      </span>
      <UTabs
        :items="conditions"
        :model-value="ruleGroup.condition"
        size="xs"
        @update:model-value="ruleGroup.condition = $event as RuleGroup['condition']"
      />
      <span class="text-muted">
        {{ t('advancedSearch.createFiltersAfter-nuxt') }}
      </span>
    </div>

    <ul class="flex flex-col gap-0.5">
      <li v-for="(rule, i) in ruleGroup.rules" :key="i">
        <div v-if="i > 0" class="text-muted flex items-center gap-2.5 py-2">
          <span class="bg-accented h-px flex-1" aria-hidden="true" />
          <span class="font-semibold uppercase">
            {{ t(`advancedSearch.matchWord.${ruleGroup.condition}`) }}
          </span>
          <span class="bg-accented h-px flex-1" aria-hidden="true" />
        </div>

        <p
          v-if="isRuleGroup(rule)"
          class="border-default bg-default rounded-lg border px-3 py-2.5"
        >
          {{ t('advancedSearch.noNestedRules') }}
        </p>
        <ContactFilterRule
          v-else
          :rule="rule"
          :filter-groups="baseFilterGroups"
          @update:rule="ruleGroup.rules[i] = $event"
          @remove="ruleGroup.rules.splice(i, 1)"
        />
      </li>
    </ul>

    <div class="mt-3 flex flex-wrap items-center gap-3">
      <UPopover v-model:open="addPickerOpen">
        <UButton
          color="primary"
          variant="outline"
          icon="i-lucide-plus"
          class="border-dashed"
        >
          {{ t('advancedSearch.addRule-nuxt') }}
        </UButton>

        <template #content>
          <ContactFilterFieldPicker
            :filter-groups="baseFilterGroups"
            @select="handleAddRule"
          />
        </template>
      </UPopover>

      <span v-if="matchCount !== undefined" class="text-muted ml-auto">
        <i18n-t keypath="advancedSearch.matchCount-nuxt">
          <template #count>
            <b class="text-highlighted font-semibold">{{ n(matchCount) }}</b>
          </template>
        </i18n-t>
      </span>

      <UButton
        :class="matchCount === undefined && 'ml-auto'"
        @click="handleSubmit"
      >
        {{ t('actions.search') }}
      </UButton>
      <UButton variant="link" @click="handleReset">
        {{ t('actions.reset') }}
      </UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Rule, RuleGroup } from '@beabee/beabee-common';

import { isRuleGroup } from '@beabee/beabee-common';
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { FilterGroups, FilterItem } from '../../../../type/search';
import { copyRuleGroup, createNewRule } from '../../../../utils/rules';
import ContactFilterFieldPicker from './ContactFilterFieldPicker.vue';
import ContactFilterRule from './ContactFilterRule.vue';

const { t, n } = useI18n();

const props = defineProps<{
  /** All available filter groups, including the crowdNewsroom group */
  filterGroups: FilterGroups;
  /** Number of contacts the unapplied rules currently match */
  matchCount?: number;
}>();

const emit = defineEmits<{
  (event: 'reset'): void;
  /** Emitted once the rules are applied or cleared, so the panel can be hidden */
  (event: 'close'): void;
  /** Emitted as the rules are edited, before they're applied */
  (event: 'change', rules: RuleGroup): void;
}>();

const modelValue = defineModel<RuleGroup>();

const addPickerOpen = ref(false);

const conditions = computed(() => [
  { value: 'AND' as const, label: t('advancedSearch.createFiltersType.all') },
  { value: 'OR' as const, label: t('advancedSearch.createFiltersType.any') },
]);

/** The crowdNewsroom group is browsed through the field picker instead */
const baseFilterGroups = computed(() =>
  props.filterGroups.filter((group) => !group.custom)
);

const ruleGroup = reactive<RuleGroup>({ condition: 'AND', rules: [] });

function reset() {
  const newRuleGroup = modelValue.value
    ? copyRuleGroup(modelValue.value)
    : { condition: 'AND' as const, rules: [] };

  ruleGroup.condition = newRuleGroup.condition;
  ruleGroup.rules = newRuleGroup.rules;
}

function handleAddRule(field: string, item: FilterItem) {
  addPickerOpen.value = false;
  ruleGroup.rules.push(createNewRule(field, item.type));
}

function handleSubmit() {
  modelValue.value = {
    condition: ruleGroup.condition,
    rules: ruleGroup.rules as (Rule | RuleGroup)[],
  };
  emit('close');
}

function handleReset() {
  emit('reset');
  reset();
  emit('close');
}

watch(modelValue, reset, { immediate: true });
watch(ruleGroup, () => emit('change', copyRuleGroup(ruleGroup)), {
  deep: true,
  immediate: true,
});
</script>
