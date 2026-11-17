<script lang="ts" setup>
import { reactive } from 'vue';

import AppCardHeader from './AppCardHeader.vue';

const state = reactive({
  icon: 'i-lucide-credit-card',
  title: 'Your contribution',
  description: '',
  level: 3 as 2 | 3 | 4 | 5 | 6,
});
</script>

<template>
  <Story title="Card/AppCardHeader">
    <Variant title="Playground">
      <div class="nuxt-page max-w-sm">
        <UCard>
          <template #header>
            <AppCardHeader
              :icon="state.icon"
              :title="state.title"
              :description="state.description || undefined"
              :level="state.level"
            />
          </template>
          <p class="text-muted">Card body content goes here.</p>
        </UCard>
      </div>

      <template #controls>
        <HstText v-model="state.icon" title="Icon" />
        <HstText v-model="state.title" title="Title" />
        <HstText v-model="state.description" title="Description" />
        <HstNumber
          v-model="state.level"
          title="Heading level"
          :min="2"
          :max="6"
        />
      </template>
    </Variant>

    <Variant title="With status badge">
      <div class="nuxt-page max-w-sm">
        <UCard>
          <template #header>
            <AppCardHeader
              icon="i-lucide-credit-card"
              title="Your contribution"
              :level="3"
            >
              <template #aside>
                <UBadge color="success" variant="subtle" class="shrink-0">
                  Active
                </UBadge>
              </template>
            </AppCardHeader>
          </template>
          <p class="text-muted">Card body content goes here.</p>
        </UCard>
      </div>
    </Variant>

    <Variant title="Edge-to-edge list with count and footer">
      <div class="nuxt-page max-w-lg">
        <UCard :ui="{ body: 'p-0 sm:p-0', footer: 'p-0 sm:p-0' }">
          <template #header>
            <AppCardHeader
              icon="i-lucide-megaphone"
              title="Open CrowdNewsrooms"
              :level="3"
            >
              <template #aside>
                <span class="shrink-0 text-muted">4 open</span>
              </template>
            </AppCardHeader>
          </template>
          <ul class="divide-y divide-default">
            <li class="p-4 sm:px-6">First row</li>
            <li class="p-4 sm:px-6">Second row</li>
          </ul>
          <template #footer>
            <a
              href="#"
              class="block px-4 py-3 font-medium text-primary sm:px-6"
            >
              See all
            </a>
          </template>
        </UCard>
      </div>
    </Variant>
  </Story>
</template>
