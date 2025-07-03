<template>
  <form @submit.prevent="handleSubmit">
    <div
      class="mb-3 flex items-center gap-2 text-sm font-semibold text-body-80"
    >
      <span>
        {{ t('advancedSearch.createFiltersBefore') }}
      </span>
      <AppSelect
        v-model="ruleGroup.condition"
        :items="[
          { id: 'AND', label: t('advancedSearch.createFiltersType.all') },
          { id: 'OR', label: t('advancedSearch.createFiltersType.any') },
        ]"
        required
      />
      <span>{{ t('advancedSearch.createFiltersAfter') }}</span>
    </div>

    <div class="relative mb-4">
      <ul class="mb-2 text-sm">
        <li
          v-for="(_, i) in ruleGroup.rules"
          :key="i"
          class="group relative -mx-4 gap-2 border-b border-t-4 border-white bg-primary-5 px-4 pb-5 pt-3 first:border-t"
        >
          <AppSearchRuleOrGroup
            v-model:rule="ruleGroup.rules[i]"
            :filter-groups="filterGroups"
            :locale="locale"
            @remove="removeRule(i)"
          />
          <span
            class="absolute bottom-full left-1/2 z-10 -translate-x-1/2 translate-y-1/2 rounded bg-primary-70 px-2 py-1 font-bold uppercase text-white group-first:hidden"
            >{{ t(`advancedSearch.matchWord.${ruleGroup.condition}`) }}</span
          >
        </li>
      </ul>
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
        <AppButton
          variant="primaryOutlined"
          :icon="faPlus"
          size="xs"
          @click="addRule"
        >
          {{ t('advancedSearch.addRule') }}
        </AppButton>
      </div>
    </div>

    <div class="flex gap-2">
      <AppButton
        variant="link"
        :disabled="validation.$invalid || !hasChanged"
        type="submit"
      >
        {{ t('actions.search') }}
      </AppButton>
      <AppButton v-if="hasChanged" variant="text" @click="handleReset">
        {{ t('actions.reset') }}
      </AppButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Rule, RuleGroup } from '@beabee/beabee-common';
import type { BaseLocale } from '@beabee/locale';
import { AppButton, AppSelect } from '@beabee/vue';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import useVuelidate from '@vuelidate/core';
import { computed, reactive, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { FilterGroups, RuleGroupWithEmpty } from '../../types/search';
import { copyRuleGroup, isRuleGroupEqual } from '../../utils/rules';
import AppSearchRuleOrGroup from './AppSearchRuleOrGroup.vue';

const { t } = useI18n();

/**
 * Search form component for building complex filter rules.
 * Now uses internal i18n for all UI text.
 *
 * @param filterGroups - Available filter groups
 * @param modelValue - The current rule group
 * @param hasChanged - Whether the form has changes
 * @param locale - Locale for date formatting
 */

interface Props {
  filterGroups: FilterGroups;
  modelValue: RuleGroup | undefined;
  hasChanged: boolean;
  locale?: BaseLocale;
}

interface Emits {
  (event: 'update:modelValue', value: RuleGroup): void;
  (event: 'reset'): void;
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'en' as BaseLocale,
});

const emit = defineEmits<Emits>();

const validation = useVuelidate();

const ruleGroup = reactive<RuleGroupWithEmpty>({
  condition: 'AND',
  rules: [null],
});

const hasChanged = computed(
  () =>
    props.hasChanged ||
    (props.modelValue
      ? !isRuleGroupEqual(props.modelValue, ruleGroup)
      : ruleGroup.rules.length > 1 || ruleGroup.rules[0] !== null)
);

function reset() {
  const newRuleGroup = props.modelValue
    ? copyRuleGroup(props.modelValue)
    : {
        condition: 'AND' as const,
        rules: [null],
      };

  ruleGroup.condition = newRuleGroup.condition;
  ruleGroup.rules = newRuleGroup.rules.length > 0 ? newRuleGroup.rules : [null];
}

function removeRule(i: number) {
  ruleGroup.rules.splice(i, 1);
  if (ruleGroup.rules.length === 0) {
    addRule();
  }
}

function addRule() {
  ruleGroup.rules.push(null);
}

function handleSubmit() {
  emit('update:modelValue', {
    condition: ruleGroup.condition,
    rules: ruleGroup.rules.filter(
      (rule): rule is Rule | RuleGroup => rule !== null
    ),
  });
}

function handleReset() {
  emit('reset');
  reset();
}

watch(toRef(props, 'modelValue'), reset, { immediate: true });
</script>
