<template>
  <div v-if="isEmbed" class="flex h-screen w-full flex-col md:flex-row">
    <router-view />
  </div>
  <div v-else class="relative flex h-screen w-full flex-col md:flex-row">
    <TheMenu />
    <main
      id="top"
      class="flex h-screen w-full flex-col overflow-y-auto bg-primary-5"
    >
      <TheBreadcrumb
        v-if="items.length > 0"
        :items="items"
        class="flex-none p-4 md:p-5"
      />
      <div class="flex flex-col p-4 pb-0 md:p-5 md:pb-0">
        <router-view />
      </div>
      <TheFooter class="mt-auto flex-none" />
    </main>
  </div>
</template>

<script lang="ts" setup>
/**
 * Dashboard Layout
 *
 * This layout is used for dashboard pages and makes the full content scrollable
 *
 * @component
 */

import TheMenu from './menu/TheMenu.vue';
import TheFooter from '../components/TheFooter.vue';
import { breadcrumbItems } from '../store/breadcrumb';
import TheBreadcrumb from '../components/TheBreadcrumb.vue';
import { computed } from 'vue';
import { isEmbed } from '../store';

const items = computed(() => breadcrumbItems.flatMap((bi) => bi.value));
</script>
