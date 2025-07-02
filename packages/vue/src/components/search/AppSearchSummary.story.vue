<script setup lang="ts">
import type { RuleGroup } from '@beabee/beabee-common';

import { reactive, ref } from 'vue';

import type { FilterGroups } from '../../types/search';
import AppSearchSummary from './AppSearchSummary.vue';

// Mock filter groups for demonstration
const filterGroups = ref<FilterGroups>([
  {
    id: 'member',
    label: 'Member Filters',
    items: {
      firstname: {
        type: 'text',
        label: 'First Name',
      },
      lastname: {
        type: 'text',
        label: 'Last Name',
      },
      email: {
        type: 'text',
        label: 'Email',
      },
      age: {
        type: 'number',
        label: 'Age',
      },
      active: {
        type: 'boolean',
        label: 'Active Status',
      },
      membershipType: {
        type: 'enum',
        label: 'Membership Type',
        options: [
          { id: 'basic', label: 'Basic' },
          { id: 'premium', label: 'Premium' },
          { id: 'enterprise', label: 'Enterprise' },
        ],
      },
    },
  },
]);

// Demo data
const singleRuleGroup = reactive<RuleGroup>({
  condition: 'AND',
  rules: [
    {
      field: 'firstname',
      operator: 'contains',
      value: ['John'],
    },
  ],
});

const multipleRulesGroup = reactive<RuleGroup>({
  condition: 'OR',
  rules: [
    {
      field: 'firstname',
      operator: 'contains',
      value: ['John'],
    },
    {
      field: 'age',
      operator: 'greater_or_equal',
      value: [25],
    },
    {
      field: 'membershipType',
      operator: 'equal',
      value: ['premium'],
    },
  ],
});

const complexRulesGroup = reactive<RuleGroup>({
  condition: 'AND',
  rules: [
    {
      field: 'active',
      operator: 'equal',
      value: [true],
    },
    {
      field: 'email',
      operator: 'contains',
      value: ['@example.com'],
    },
    {
      field: 'age',
      operator: 'between',
      value: [18, 65],
    },
    {
      field: 'membershipType',
      operator: 'not_equal',
      value: ['basic'],
    },
  ],
});

function handleRuleUpdate(ruleGroup: RuleGroup, newValue: RuleGroup) {
  ruleGroup.condition = newValue.condition;
  ruleGroup.rules = newValue.rules;
  console.log('Rules updated:', newValue);
}
</script>

<template>
  <Story title="Search/AppSearchSummary">
    <Variant title="No Rules">
      <div class="max-w-2xl">
        <AppSearchSummary
          :model-value="{ condition: 'AND', rules: [] }"
          :filter-groups="filterGroups"
        />
        <p class="text-gray-600 mt-2 text-sm">
          Shows empty state when no rules are provided.
        </p>
      </div>
    </Variant>

    <Variant title="Simple Rules (AND)">
      <div class="max-w-2xl">
        <AppSearchSummary
          :model-value="singleRuleGroup"
          :filter-groups="filterGroups"
        />
        <div class="border-gray-200 bg-gray-50 mt-4 rounded border p-3">
          <h4 class="mb-2 text-sm font-semibold">Rule Structure:</h4>
          <pre class="text-gray-600 text-xs">{{
            JSON.stringify(singleRuleGroup, null, 2)
          }}</pre>
        </div>
      </div>
    </Variant>

    <Variant title="Complex Nested Rules (OR)">
      <div class="max-w-2xl">
        <AppSearchSummary
          :model-value="multipleRulesGroup"
          :filter-groups="filterGroups"
        />
        <div class="border-gray-200 bg-gray-50 mt-4 rounded border p-3">
          <h4 class="mb-2 text-sm font-semibold">Rule Structure:</h4>
          <pre class="text-gray-600 text-xs">{{
            JSON.stringify(multipleRulesGroup, null, 2)
          }}</pre>
        </div>
      </div>
    </Variant>

    <Variant title="Complex Rules">
      <div class="max-w-2xl">
        <AppSearchSummary
          :model-value="complexRulesGroup"
          :filter-groups="filterGroups"
        />
        <div class="border-gray-200 bg-gray-50 mt-4 rounded border p-3">
          <h4 class="mb-2 text-sm font-semibold">Rule Structure:</h4>
          <pre class="text-gray-600 text-xs">{{
            JSON.stringify(complexRulesGroup, null, 2)
          }}</pre>
        </div>
      </div>
    </Variant>

    <Variant title="Responsive Layout">
      <div class="max-w-sm">
        <AppSearchSummary
          :model-value="complexRulesGroup"
          :filter-groups="filterGroups"
        />
        <p class="text-gray-600 mt-2 text-sm">
          This demonstrates how the summary adapts to smaller screens.
        </p>
      </div>
    </Variant>
  </Story>
</template>
