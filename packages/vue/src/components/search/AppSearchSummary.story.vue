<script setup lang="ts">
import type { RuleGroup } from '@beabee/beabee-common';

import { ref } from 'vue';

import type { FilterGroups, OperatorLabels } from '../../types/search';
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
      joinDate: {
        type: 'date',
        label: 'Join Date',
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
      age: {
        type: 'number',
        label: 'Age',
      },
    },
  },
  {
    id: 'activity',
    label: 'Activity Filters',
    items: {
      lastLogin: {
        type: 'date',
        label: 'Last Login',
      },
      loginCount: {
        type: 'number',
        label: 'Login Count',
      },
      tags: {
        type: 'array',
        label: 'Tags',
        options: [
          { id: 'vip', label: 'VIP' },
          { id: 'beta-tester', label: 'Beta Tester' },
          { id: 'newsletter', label: 'Newsletter Subscriber' },
        ],
      },
    },
  },
]);

const operatorLabels: OperatorLabels = {
  text: {
    equal: 'equals',
    not_equal: 'does not equal',
    contains: 'contains',
    not_contains: 'does not contain',
    begins_with: 'begins with',
    not_begins_with: 'does not begin with',
    ends_with: 'ends with',
    not_ends_with: 'does not end with',
  },
  blob: {
    contains: 'contains',
    not_contains: 'does not contain',
  },
  number: {
    equal: 'equals',
    not_equal: 'does not equal',
    less: 'is less than',
    less_or_equal: 'is less than or equal to',
    greater: 'is greater than',
    greater_or_equal: 'is greater than or equal to',
    between: 'is between',
    not_between: 'is not between',
  },
  enum: {
    equal: 'equals',
    not_equal: 'does not equal',
  },
  boolean: {
    equal: 'is',
  },
  contact: {
    equal: 'equals',
    not_equal: 'does not equal',
    contains: 'contains',
    not_contains: 'does not contain',
    begins_with: 'begins with',
    not_begins_with: 'does not begin with',
    ends_with: 'ends with',
    not_ends_with: 'does not end with',
  },
  date: {
    equal: 'is',
    not_equal: 'is not',
    less: 'is before',
    less_or_equal: 'is before or on',
    greater: 'is after',
    greater_or_equal: 'is after or on',
    between: 'is between',
    not_between: 'is not between',
  },
  array: {
    contains: 'contains',
    not_contains: 'does not contain',
  },
  all: {
    is_empty: 'is empty',
    is_not_empty: 'is not empty',
  },
};

// Labels object removed - AppSearchSummary now uses internal i18n

// Sample rules for demonstration
const simpleRules: RuleGroup = {
  condition: 'AND',
  rules: [
    {
      field: 'firstname',
      operator: 'contains',
      value: ['John'],
    },
    {
      field: 'active',
      operator: 'equal',
      value: [true],
    },
  ],
};

const complexRules: RuleGroup = {
  condition: 'OR',
  rules: [
    {
      field: 'email',
      operator: 'ends_with',
      value: ['@company.com'],
    },
    {
      condition: 'AND',
      rules: [
        {
          field: 'age',
          operator: 'between',
          value: [25, 45],
        },
        {
          field: 'membershipType',
          operator: 'equal',
          value: ['premium'],
        },
      ],
    },
  ],
};

const booleanRules: RuleGroup = {
  condition: 'AND',
  rules: [
    {
      field: 'active',
      operator: 'equal',
      value: [true],
    },
    {
      field: 'lastname',
      operator: 'not_equal',
      value: ['Smith'],
    },
  ],
};

const arrayRules: RuleGroup = {
  condition: 'AND',
  rules: [
    {
      field: 'tags',
      operator: 'contains',
      value: ['vip'],
    },
    {
      field: 'loginCount',
      operator: 'greater',
      value: [10],
    },
  ],
};
</script>

<template>
  <Story title="Search/AppSearchSummary">
    <Variant title="No Rules">
      <div class="max-w-2xl">
        <AppSearchSummary
          :model-value="{ condition: 'AND', rules: [] }"
          :filter-groups="filterGroups"
          :operator-labels="operatorLabels"
        />
        <p class="text-gray-600 mt-2 text-sm">
          Shows empty state when no rules are provided.
        </p>
      </div>
    </Variant>

    <Variant title="Simple Rules (AND)">
      <div class="max-w-2xl">
        <AppSearchSummary
          :model-value="simpleRules"
          :filter-groups="filterGroups"
          :operator-labels="operatorLabels"
        />
        <div class="border-gray-200 bg-gray-50 mt-4 rounded border p-3">
          <h4 class="mb-2 text-sm font-semibold">Rule Structure:</h4>
          <pre class="text-gray-600 text-xs">{{
            JSON.stringify(simpleRules, null, 2)
          }}</pre>
        </div>
      </div>
    </Variant>

    <Variant title="Complex Nested Rules (OR)">
      <div class="max-w-2xl">
        <AppSearchSummary
          :model-value="complexRules"
          :filter-groups="filterGroups"
          :operator-labels="operatorLabels"
        />
        <div class="border-gray-200 bg-gray-50 mt-4 rounded border p-3">
          <h4 class="mb-2 text-sm font-semibold">Rule Structure:</h4>
          <pre class="text-gray-600 text-xs">{{
            JSON.stringify(complexRules, null, 2)
          }}</pre>
        </div>
      </div>
    </Variant>

    <Variant title="Boolean and Text Rules">
      <div class="max-w-2xl">
        <AppSearchSummary
          :model-value="booleanRules"
          :filter-groups="filterGroups"
          :operator-labels="operatorLabels"
        />
        <div class="border-gray-200 bg-gray-50 mt-4 rounded border p-3">
          <h4 class="mb-2 text-sm font-semibold">Rule Structure:</h4>
          <pre class="text-gray-600 text-xs">{{
            JSON.stringify(booleanRules, null, 2)
          }}</pre>
        </div>
      </div>
    </Variant>

    <Variant title="Array and Number Rules">
      <div class="max-w-2xl">
        <AppSearchSummary
          :model-value="arrayRules"
          :filter-groups="filterGroups"
          :operator-labels="operatorLabels"
        />
        <div class="border-gray-200 bg-gray-50 mt-4 rounded border p-3">
          <h4 class="mb-2 text-sm font-semibold">Rule Structure:</h4>
          <pre class="text-gray-600 text-xs">{{
            JSON.stringify(arrayRules, null, 2)
          }}</pre>
        </div>
      </div>
    </Variant>

    <Variant title="Responsive Layout">
      <div class="max-w-sm">
        <AppSearchSummary
          :model-value="complexRules"
          :filter-groups="filterGroups"
          :operator-labels="operatorLabels"
        />
        <p class="text-gray-600 mt-2 text-sm">
          This demonstrates how the summary adapts to smaller screens.
        </p>
      </div>
    </Variant>
  </Story>
</template>
