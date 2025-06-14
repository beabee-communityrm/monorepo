<script lang="ts" setup>
import { reactive } from 'vue';

import type { TabItem } from '../../types';
import AppFilterGrid from './AppFilterGrid.vue';

const state = reactive({
  currentFilter: 'all',
});

const filterItems: TabItem[] = [
  { id: 'all', label: 'All Items', count: 25 },
  { id: 'active', label: 'Active', count: 15 },
  { id: 'pending', label: 'Pending', count: 5 },
  { id: 'completed', label: 'Completed', count: 5 },
];

const categoryItems: TabItem[] = [
  { id: 'products', label: 'Products', count: 12 },
  { id: 'services', label: 'Services', count: 8 },
  { id: 'support', label: 'Support', count: 3 },
];

const statusItems: TabItem[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'review', label: 'In Review' },
  { id: 'published', label: 'Published' },
  { id: 'archived', label: 'Archived' },
];

const sampleContent: Record<string, { title: string; description: string }> = {
  all: {
    title: 'All Items',
    description: 'Showing all available items in the system.',
  },
  active: {
    title: 'Active Items',
    description: 'Currently active and available items.',
  },
  pending: {
    title: 'Pending Items',
    description: 'Items waiting for approval or processing.',
  },
  completed: {
    title: 'Completed Items',
    description: 'Successfully processed items.',
  },
  products: {
    title: 'Products',
    description: 'Physical and digital products.',
  },
  services: {
    title: 'Services',
    description: 'Available services and offerings.',
  },
  support: {
    title: 'Support',
    description: 'Support tickets and documentation.',
  },
  draft: { title: 'Draft Items', description: 'Items in draft status.' },
  review: {
    title: 'Items Under Review',
    description: 'Items currently being reviewed.',
  },
  published: {
    title: 'Published Items',
    description: 'Live and published items.',
  },
  archived: {
    title: 'Archived Items',
    description: 'Items that have been archived.',
  },
};
</script>

<template>
  <Story title="Components/Layout/AppFilterGrid">
    <Variant title="Playground">
      <div class="h-96">
        <AppFilterGrid v-model="state.currentFilter" :items="filterItems">
          <div class="rounded border p-4">
            <h3 class="mb-2 text-lg font-semibold">
              {{ sampleContent[state.currentFilter]?.title || 'Content' }}
            </h3>
            <p class="text-body-80">
              {{
                sampleContent[state.currentFilter]?.description ||
                'Select a filter to see content.'
              }}
            </p>
            <div
              class="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3"
            >
              <div
                v-for="i in filterItems.find(
                  (item) => item.id === state.currentFilter
                )?.count || 1"
                :key="i"
                class="rounded bg-grey-lighter p-3"
              >
                <p class="font-medium">Item {{ i }}</p>
                <p class="text-sm text-body-80">Sample item content</p>
              </div>
            </div>
          </div>
        </AppFilterGrid>
      </div>

      <template #controls>
        <HstSelect
          v-model="state.currentFilter"
          title="Current Filter"
          :options="
            filterItems.map((item) => ({ value: item.id, label: item.label }))
          "
        />
      </template>
    </Variant>

    <Variant title="Category Filters">
      <div class="h-96">
        <AppFilterGrid v-model="state.currentFilter" :items="categoryItems">
          <div class="rounded border p-4">
            <h3 class="mb-2 text-lg font-semibold">
              {{ sampleContent[state.currentFilter]?.title || 'Categories' }}
            </h3>
            <p class="text-body-80">
              {{
                sampleContent[state.currentFilter]?.description ||
                'Browse by category.'
              }}
            </p>
            <div class="mt-4 space-y-2">
              <div
                v-for="i in categoryItems.find(
                  (item) => item.id === state.currentFilter
                )?.count || 1"
                :key="i"
                class="flex items-center gap-3 rounded border p-3"
              >
                <div class="h-10 w-10 rounded bg-primary-20"></div>
                <div>
                  <p class="font-medium">{{ state.currentFilter }} {{ i }}</p>
                  <p class="text-sm text-body-80">
                    Description for item {{ i }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AppFilterGrid>
      </div>
    </Variant>

    <Variant title="Status Filters">
      <div class="h-96">
        <AppFilterGrid v-model="state.currentFilter" :items="statusItems">
          <div class="rounded border p-4">
            <h3 class="mb-2 text-lg font-semibold">
              {{ sampleContent[state.currentFilter]?.title || 'Status View' }}
            </h3>
            <p class="text-body-80">
              {{
                sampleContent[state.currentFilter]?.description ||
                'Filter by status.'
              }}
            </p>
            <div class="mt-4">
              <div class="overflow-hidden rounded border">
                <table class="w-full">
                  <thead class="bg-grey-lighter">
                    <tr>
                      <th class="px-4 py-2 text-left">Name</th>
                      <th class="px-4 py-2 text-left">Status</th>
                      <th class="px-4 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="i in 5" :key="i" class="border-t">
                      <td class="px-4 py-2">Item {{ i }}</td>
                      <td class="px-4 py-2">
                        <span
                          class="text-success-80 rounded bg-success-10 px-2 py-1 text-xs"
                        >
                          {{ state.currentFilter }}
                        </span>
                      </td>
                      <td class="px-4 py-2 text-sm text-body-80">
                        {{ new Date().toLocaleDateString() }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </AppFilterGrid>
      </div>
    </Variant>

    <Variant title="Responsive Behavior">
      <div class="h-96">
        <AppFilterGrid v-model="state.currentFilter" :items="filterItems">
          <div class="rounded border p-4">
            <h3 class="mb-2 text-lg font-semibold">Responsive Filter Grid</h3>
            <p class="mb-4 text-body-80">
              This demonstrates how the component adapts to different screen
              sizes. On mobile, tabs are shown as a compact horizontal list. On
              desktop, tabs are displayed vertically in a sidebar.
            </p>
            <div class="bg-info-10 rounded p-3">
              <p class="text-info-80 text-sm">
                <strong>Tip:</strong> Resize your browser window to see the
                responsive behavior. The layout automatically switches between
                compact horizontal tabs (mobile) and vertical tabs (desktop).
              </p>
            </div>
          </div>
        </AppFilterGrid>
      </div>
    </Variant>
  </Story>
</template>
