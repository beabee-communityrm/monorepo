<!--
  # ContactFilterPanel
  Builds the rule group used to filter contacts.

  Rules are added by picking a field, so every rule starts out complete; there
  are no empty rule rows. Nested rule groups can't be edited here, matching the
  behaviour of the previous search form.
-->
<template>
  <div ref="root" class="border-b border-default bg-elevated/40 p-4">
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <span class="text-muted">
        {{ t('advancedSearch.createFiltersBefore-nuxt') }}
      </span>
      <ContactFilterToggle
        v-model="ruleGroup.condition"
        :options="conditions"
        :label="t('advancedSearch.matchCondition-nuxt')"
      />
      <span class="text-muted">
        {{ t('advancedSearch.createFiltersAfter-nuxt') }}
      </span>
    </div>

    <ul class="flex flex-col gap-0.5">
      <li v-for="(rule, i) in ruleGroup.rules" :key="i">
        <div v-if="i > 0" class="flex items-center gap-2.5 py-2 text-muted">
          <span class="h-px flex-1 bg-accented" aria-hidden="true" />
          <span class="font-semibold uppercase">
            {{ t(`advancedSearch.matchWord.${ruleGroup.condition}`) }}
          </span>
          <span class="h-px flex-1 bg-accented" aria-hidden="true" />
        </div>

        <p
          v-if="isRuleGroup(rule)"
          class="rounded-lg border border-default bg-default px-3 py-2.5"
        >
          {{ t('advancedSearch.noNestedRules') }}
        </p>
        <ContactFilterRule
          v-else
          :rule="rule"
          :filter-groups="baseFilterGroups"
          :show-errors="showErrors"
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

      <span v-if="matchCount !== undefined" class="ml-auto text-muted">
        <i18n-t keypath="advancedSearch.matchCount-nuxt">
          <template #count>
            <b class="font-semibold text-highlighted">{{ n(matchCount) }}</b>
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
import { computed, nextTick, reactive, ref, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { FilterGroups, FilterItem } from '../../../../type/search';
import { copyRuleGroup, createNewRule } from '../../../../utils/rules';
import ContactFilterFieldPicker from './ContactFilterFieldPicker.vue';
import ContactFilterRule from './ContactFilterRule.vue';
import ContactFilterToggle from './ContactFilterToggle.vue';

const { t, n } = useI18n();

const props = defineProps<{
  /** All available filter groups, including the crowdNewsroom group */
  filterGroups: FilterGroups;
  /** Counts the contacts some rules match, for showing before they're applied */
  countMatches: (rules: RuleGroup) => Promise<number>;
}>();

const emit = defineEmits<{
  (event: 'reset'): void;
  /** Emitted once the rules are applied or cleared, so the panel can be hidden */
  (event: 'close'): void;
}>();

const modelValue = defineModel<RuleGroup>();

const addPickerOpen = ref(false);
/** Number of contacts the unapplied rules currently match */
const matchCount = ref<number>();
let matchCountTimer: ReturnType<typeof setTimeout>;
/** Set once Search is pressed with a value missing, so empty fields show it */
const showErrors = ref(false);
const root = useTemplateRef('root');

const conditions = computed(() => [
  { value: 'AND' as const, label: t('advancedSearch.createFiltersType.all') },
  { value: 'OR' as const, label: t('advancedSearch.createFiltersType.any') },
]);

/** The crowdNewsroom group is browsed through the field picker instead */
const baseFilterGroups = computed(() =>
  props.filterGroups.filter((group) => !group.custom)
);

const ruleGroup = reactive<RuleGroup>({ condition: 'AND', rules: [] });

/** Nested groups can't be edited here, so they're taken as they are */
const allValuesFilled = computed(() =>
  ruleGroup.rules.every(
    (rule) => isRuleGroup(rule) || rule.value.every((value) => value !== '')
  )
);

function reset() {
  showErrors.value = false;
  const newRuleGroup = modelValue.value
    ? copyRuleGroup(modelValue.value)
    : { condition: 'AND' as const, rules: [] };

  ruleGroup.condition = newRuleGroup.condition;
  ruleGroup.rules = newRuleGroup.rules;
}

function updateMatchCount() {
  const rules = copyRuleGroup(ruleGroup);
  clearTimeout(matchCountTimer);
  matchCountTimer = setTimeout(async () => {
    try {
      matchCount.value = await props.countMatches(rules);
    } catch {
      matchCount.value = undefined;
    }
  }, 400);
}

function handleAddRule(field: string, item: FilterItem) {
  addPickerOpen.value = false;
  ruleGroup.rules.push(createNewRule(field, item.type));
}

async function handleSubmit() {
  if (!allValuesFilled.value) {
    showErrors.value = true;
    await nextTick();
    root.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    return;
  }

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
watch(ruleGroup, updateMatchCount, { deep: true, immediate: true });
</script>
