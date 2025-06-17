<script setup lang="ts">
import { reactive } from 'vue';

import { type Header, type Item, type Sort, SortType } from '../../types/table';
import AppTable from './AppTable.vue';

interface SampleItem extends Item {
  id: number;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  status: 'active' | 'inactive';
}

const headers: Header[] = [
  { text: 'Name', value: 'name', sortable: true },
  { text: 'Email', value: 'email', sortable: true },
  { text: 'Role', value: 'role' },
  { text: 'Joined', value: 'joinedAt', sortable: true, align: 'right' },
  { text: 'Status', value: 'status', align: 'center' },
];

const sampleData: SampleItem[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    joinedAt: '2024-01-15',
    status: 'active',
    selected: false,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Member',
    joinedAt: '2024-02-20',
    status: 'active',
    selected: false,
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Member',
    joinedAt: '2024-03-10',
    status: 'inactive',
    selected: false,
  },
];

const state = reactive({
  sort: { by: 'name', type: SortType.Asc } as Sort,
  items: sampleData,
  loadingItems: null as SampleItem[] | null,
  emptyItems: [] as SampleItem[],
});
</script>

<template>
  <Story title="Table/AppTable" :layout="{ type: 'grid', width: '100%' }">
    <Variant title="Basic Table">
      <AppTable
        v-model:sort="state.sort"
        :headers="headers"
        :items="state.items"
      />
    </Variant>

    <Variant title="Selectable Table">
      <AppTable
        v-model:sort="state.sort"
        :headers="headers"
        :items="state.items"
        selectable
      />
    </Variant>

    <Variant title="Loading State">
      <AppTable
        v-model:sort="state.sort"
        :headers="headers"
        :items="state.loadingItems"
        loading-text="Loading data..."
      />
    </Variant>

    <Variant title="Empty State">
      <AppTable
        v-model:sort="state.sort"
        :headers="headers"
        :items="state.emptyItems"
        empty-text="No users found"
      />
    </Variant>

    <Variant title="Custom Slots">
      <AppTable
        v-model:sort="state.sort"
        :headers="headers"
        :items="state.items"
        selectable
      >
        <template #value-name="{ item, value }">
          <strong>{{ value }}</strong>
          <div class="text-gray-500 text-xs">ID: {{ item.id }}</div>
        </template>

        <template #value-status="{ value }">
          <span
            :class="[
              'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
              value === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800',
            ]"
          >
            {{ value }}
          </span>
        </template>

        <template #after="{ item }">
          <div v-if="item.selected" class="text-blue-600 pl-2 text-xs">
            Additional info when selected: {{ item.email }}
          </div>
        </template>
      </AppTable>
    </Variant>
  </Story>
</template>

<docs lang="md">
# AppTable

A reusable data table component with sorting, selection, and slot support.

## Features

- **Sortable columns**: Click headers to sort data
- **Row selection**: Optional checkboxes for multi-selection
- **Flexible slots**: Custom content for headers, cells, and rows
- **Loading & empty states**: Built-in states with customizable text
- **Responsive design**: Mobile-friendly with horizontal scrolling
- **Accessible**: ARIA attributes and keyboard navigation

## Usage

```vue
<template>
  <AppTable
    v-model:sort="sort"
    :headers="headers"
    :items="items"
    :selectable="true"
    empty-text="No results found"
    loading-text="Loading..."
  >
    <template #value-status="{ value }">
      <StatusBadge :status="value" />
    </template>
  </AppTable>
</template>

<script setup>
import { ref } from 'vue';
import { AppTable, SortType } from '@beabee/vue';

const sort = ref({ by: 'name', type: SortType.Asc });
const headers = [
  { text: 'Name', value: 'name', sortable: true },
  { text: 'Status', value: 'status' },
];
const items = ref([...]);
</script>
```

## Props

- `headers`: Array of column definitions
- `items`: Array of data items (null for loading state)
- `sort`: Current sort configuration
- `selectable`: Enable row selection
- `hideHeaders`: Hide table headers
- `rowClass`: Function to add custom row classes
- `emptyText`: Text for empty state
- `loadingText`: Text for loading state

## Events

- `update:sort`: Emitted when sort changes

## Slots

- `header-{column}`: Custom header content
- `value-{column}`: Custom cell content
- `after`: Content after each row
- `empty`: Custom empty state
- `loading`: Custom loading state
</docs>
