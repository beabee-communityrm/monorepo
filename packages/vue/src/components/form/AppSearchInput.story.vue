<script lang="ts" setup>
import { reactive } from 'vue';

import AppSearchInput from './AppSearchInput.vue';

const state = reactive({
  searchValue: '',
  placeholder: 'Search...',
});

const filterState = reactive({
  contactSearch: '',
  productSearch: '',
  articleSearch: '',
});
</script>

<template>
  <Story title="Components/Form/AppSearchInput">
    <Variant title="Playground">
      <div class="max-w-md space-y-6">
        <AppSearchInput
          v-model="state.searchValue"
          :placeholder="state.placeholder"
        />
        <div class="text-sm text-grey-dark">
          <p>Search value: "{{ state.searchValue }}"</p>
        </div>
      </div>

      <template #controls>
        <HstText v-model="state.searchValue" title="Search Value" />
        <HstText v-model="state.placeholder" title="Placeholder" />
      </template>
    </Variant>

    <Variant title="Examples">
      <div class="max-w-md space-y-8">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Contact Search</h3>
          <AppSearchInput
            v-model="filterState.contactSearch"
            placeholder="Search contacts..."
          />
          <p class="mt-2 text-sm text-grey-dark">
            Searching for: "{{ filterState.contactSearch }}"
          </p>
        </div>

        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Product Search</h3>
          <AppSearchInput
            v-model="filterState.productSearch"
            placeholder="Find products by name or SKU"
          />
          <p class="mt-2 text-sm text-grey-dark">
            Product filter: "{{ filterState.productSearch }}"
          </p>
        </div>

        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Article Search</h3>
          <AppSearchInput
            v-model="filterState.articleSearch"
            placeholder="Search articles and documentation"
          />
          <p class="mt-2 text-sm text-grey-dark">
            Article query: "{{ filterState.articleSearch }}"
          </p>
        </div>

        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">With Initial Value</h3>
          <AppSearchInput
            v-model="state.searchValue"
            placeholder="Search with existing value"
          />
          <p class="mt-2 text-sm text-grey-dark">
            Current search: "{{ state.searchValue }}"
          </p>
        </div>
      </div>
    </Variant>
  </Story>
</template>
