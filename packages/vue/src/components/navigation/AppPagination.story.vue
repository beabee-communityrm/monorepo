<script lang="ts" setup>
import { reactive } from 'vue';

import AppPagination from './AppPagination.vue';

const state = reactive({
  currentPage: 0,
  totalPages: 10,
});

const scenarios = [
  { name: 'Small Dataset', totalPages: 5 },
  { name: 'Medium Dataset', totalPages: 20 },
  { name: 'Large Dataset', totalPages: 100 },
];
</script>

<template>
  <Story title="Navigation/AppPagination">
    <Variant title="Playground">
      <div class="space-y-4">
        <div class="rounded border p-4">
          <h3 class="mb-2 text-lg font-semibold">
            Page {{ state.currentPage + 1 }} of {{ state.totalPages }}
          </h3>
          <p class="text-body-80">
            This content changes based on the current page selection.
          </p>
          <div class="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            <div v-for="i in 8" :key="i" class="rounded bg-grey-lighter p-2">
              <p class="text-sm">Item {{ state.currentPage * 8 + i }}</p>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <AppPagination
            v-model="state.currentPage"
            :total-pages="state.totalPages"
          />
        </div>
      </div>

      <template #controls>
        <HstNumber
          v-model="state.currentPage"
          title="Current Page (0-based)"
          :min="0"
          :max="state.totalPages - 1"
        />
        <HstNumber
          v-model="state.totalPages"
          title="Total Pages"
          :min="1"
          :max="100"
        />
      </template>
    </Variant>

    <Variant title="Different Scenarios">
      <div class="space-y-6">
        <div
          v-for="scenario in scenarios"
          :key="scenario.name"
          class="space-y-2"
        >
          <h4 class="font-medium">{{ scenario.name }}</h4>
          <p class="text-sm text-body-80">
            {{ scenario.totalPages }} pages total
          </p>
          <div class="flex justify-center">
            <AppPagination
              :model-value="0"
              :total-pages="scenario.totalPages"
            />
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Edge Cases">
      <div class="space-y-6">
        <div class="space-y-2">
          <h4 class="font-medium">Single Page</h4>
          <p class="text-sm text-body-80">
            When there's only one page, all navigation buttons are disabled
          </p>
          <div class="flex justify-center">
            <AppPagination :model-value="0" :total-pages="1" />
          </div>
        </div>

        <div class="space-y-2">
          <h4 class="font-medium">First Page</h4>
          <p class="text-sm text-body-80">
            Previous and first page buttons are disabled
          </p>
          <div class="flex justify-center">
            <AppPagination :model-value="0" :total-pages="10" />
          </div>
        </div>

        <div class="space-y-2">
          <h4 class="font-medium">Last Page</h4>
          <p class="text-sm text-body-80">
            Next and last page buttons are disabled
          </p>
          <div class="flex justify-center">
            <AppPagination :model-value="9" :total-pages="10" />
          </div>
        </div>

        <div class="space-y-2">
          <h4 class="font-medium">Middle Page</h4>
          <p class="text-sm text-body-80">All navigation buttons are enabled</p>
          <div class="flex justify-center">
            <AppPagination :model-value="4" :total-pages="10" />
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Interactive Demo">
      <div class="max-w-2xl space-y-4">
        <div class="rounded border p-4">
          <h3 class="mb-3 text-lg font-semibold">Blog Posts</h3>
          <div class="space-y-3">
            <article v-for="i in 5" :key="i" class="rounded border p-3">
              <h4 class="font-medium">
                Blog Post #{{ state.currentPage * 5 + i }}
              </h4>
              <p class="mt-1 text-sm text-body-80">
                This is a preview of blog post {{ state.currentPage * 5 + i }}.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <div class="mt-2 flex items-center gap-2 text-xs text-body-80">
                <span>Published on {{ new Date().toLocaleDateString() }}</span>
                <span>•</span>
                <span>5 min read</span>
              </div>
            </article>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <p class="text-sm text-body-80">
            Showing {{ state.currentPage * 5 + 1 }}-{{
              Math.min((state.currentPage + 1) * 5, state.totalPages * 5)
            }}
            of {{ state.totalPages * 5 }} posts
          </p>
          <AppPagination
            v-model="state.currentPage"
            :total-pages="state.totalPages"
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
