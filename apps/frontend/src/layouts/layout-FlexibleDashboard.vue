<template>
  <div v-if="isEmbed" class="w-full">
    <router-view />
  </div>
  <div v-else class="relative flex h-screen w-full flex-col md:flex-row">
    <TheMenu />
    <main id="top" class="flex w-full flex-1 flex-col bg-primary-5">
      <TheBreadcrumb
        v-if="items.length > 0"
        :items="items"
        class="flex-none p-4 md:p-5"
      />
      <div class="flex min-h-0 flex-1 flex-col p-4 pb-0 md:p-5 md:pb-0">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
/**
 * FlexibleDashboard Layout
 *
 * This layout is used for dashboard pages that have self-contained scrollable content.
 *
 * @component
 */
import { TheBreadcrumb } from '@beabee/vue';

import { computed } from 'vue';

import { isEmbed } from '../store';
import { breadcrumbItems } from '../store/breadcrumb';
import TheMenu from './menu/TheMenu.vue';

const items = computed(() => breadcrumbItems.flatMap((bi) => bi.value));
</script>
