<script setup lang="ts">
import type { RuleGroup } from '@beabee/beabee-common';

import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { reactive, ref } from 'vue';

import type { FilterGroups, OperatorLabels } from '../../types/search';
import AppSearch from './AppSearch.vue';

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

const labels = {
  advancedSearchButton: 'Advanced Search',
  createFiltersBefore: 'Show results where',
  createFiltersAfter: 'of the following conditions are met:',
  conditionTypes: {
    all: 'all',
    any: 'any',
  },
  matchConditions: {
    AND: 'AND',
    OR: 'OR',
  },
  addRule: 'Add Rule',
  search: 'Search',
  reset: 'Reset',
  selectFilter: 'Select a filter...',
  yes: 'Yes',
  no: 'No',
  relativeDatePlaceholder: '$now(d:-1)',
  and: 'and',
  nestedRules: 'Nested rules (read-only)',
  noNestedRules: 'Nested rules are not supported in edit mode',
};

// Demo state
const searchState = reactive({
  currentRules: undefined as RuleGroup | undefined,
  hasChanged: false,
});

const presetRules: RuleGroup = {
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

function handleSearch(rules: RuleGroup) {
  searchState.currentRules = rules;
  searchState.hasChanged = false;
  console.log('Search executed:', rules);
}

function handleReset() {
  searchState.currentRules = undefined;
  searchState.hasChanged = false;
  console.log('Search reset');
}

function loadPreset() {
  searchState.currentRules = presetRules;
  searchState.hasChanged = false;
}

function clearRules() {
  searchState.currentRules = undefined;
  searchState.hasChanged = false;
}
</script>

<template>
  <Story title="Search/AppSearch">
    <Variant title="Basic Usage">
      <div class="max-w-4xl">
        <AppSearch
          :model-value="searchState.currentRules"
          :filter-groups="filterGroups"
          :has-changed="searchState.hasChanged"
          :operator-labels="operatorLabels"
          :labels="labels"
          :button-icon="faFilter"
          @update:model-value="handleSearch"
          @reset="handleReset"
        >
          <div class="border-gray-200 bg-gray-50 mb-4 rounded border p-4">
            <h3 class="text-lg font-semibold">Search Demo</h3>
            <p class="text-gray-600 text-sm">
              Click "Advanced Search" below to build complex queries with
              multiple conditions.
            </p>
          </div>
        </AppSearch>

        <div class="border-gray-200 mt-6 rounded border p-4">
          <h4 class="mb-2 font-semibold">Demo Controls</h4>
          <div class="flex gap-2">
            <button
              class="bg-blue-500 hover:bg-blue-600 rounded px-3 py-1 text-sm text-white"
              @click="loadPreset"
            >
              Load Preset Rules
            </button>
            <button
              class="bg-gray-500 hover:bg-gray-600 rounded px-3 py-1 text-sm text-white"
              @click="clearRules"
            >
              Clear Rules
            </button>
          </div>
        </div>

        <div
          v-if="searchState.currentRules"
          class="border-green-200 bg-green-50 mt-4 rounded border p-4"
        >
          <h4 class="text-green-800 mb-2 font-semibold">
            Current Search Rules
          </h4>
          <pre class="text-green-700 text-sm">{{
            JSON.stringify(searchState.currentRules, null, 2)
          }}</pre>
        </div>
      </div>
    </Variant>

    <Variant title="With Preset Rules">
      <div class="max-w-4xl">
        <AppSearch
          :model-value="presetRules"
          :filter-groups="filterGroups"
          :operator-labels="operatorLabels"
          :labels="labels"
          :button-icon="faFilter"
          @update:model-value="handleSearch"
          @reset="handleReset"
        >
          <div class="border-blue-200 bg-blue-50 mb-4 rounded border p-4">
            <h3 class="text-blue-800 text-lg font-semibold">
              Search with Preset Rules
            </h3>
            <p class="text-blue-600 text-sm">
              This demonstrates the search component with existing rules loaded.
            </p>
          </div>
        </AppSearch>
      </div>
    </Variant>

    <Variant title="Single Filter Group">
      <div class="max-w-4xl">
        <AppSearch
          :model-value="undefined"
          :filter-groups="[filterGroups[0]]"
          :operator-labels="operatorLabels"
          :labels="labels"
          :button-icon="faFilter"
          @update:model-value="handleSearch"
          @reset="handleReset"
        >
          <div class="border-purple-200 bg-purple-50 mb-4 rounded border p-4">
            <h3 class="text-purple-800 text-lg font-semibold">
              Single Filter Group
            </h3>
            <p class="text-purple-600 text-sm">
              This shows the search component with only one filter group (no
              toggle).
            </p>
          </div>
        </AppSearch>
      </div>
    </Variant>

    <Variant title="Mobile Layout">
      <div class="max-w-sm">
        <AppSearch
          :model-value="undefined"
          :filter-groups="filterGroups"
          :operator-labels="operatorLabels"
          :labels="labels"
          :button-icon="faFilter"
          @update:model-value="handleSearch"
          @reset="handleReset"
        >
          <div class="border-orange-200 bg-orange-50 mb-4 rounded border p-4">
            <h3 class="text-orange-800 text-lg font-semibold">Mobile View</h3>
            <p class="text-orange-600 text-sm">
              This demonstrates how the search component adapts to smaller
              screens.
            </p>
          </div>
        </AppSearch>
      </div>
    </Variant>
  </Story>
</template>
