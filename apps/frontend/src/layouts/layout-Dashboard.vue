<template>
  <div v-if="isEmbed" class="flex justify-center">
    <router-view />
  </div>
  <div v-else class="flex h-screen">
    <TheMenu />
    <main
      id="top"
      class="flex flex-1 flex-col overflow-y-hidden bg-primary-5 p-4 pb-0 md:p-10 md:pb-0"
    >
      <TheBreadcrumb v-if="items.length > 0" :items="items" class="flex-none" />
      <div class="flex-1 overflow-y-hidden">
        <router-view />
      </div>
      <!-- TODO: Add footer on some subpages? -->
      <!-- <TheFooter class="flex-none" /> -->
    </main>
  </div>
</template>

<script lang="ts" setup>
import TheMenu from './menu/TheMenu.vue';
// import TheFooter from '../components/TheFooter.vue';
import { breadcrumbItems } from '../store/breadcrumb';
import TheBreadcrumb from '../components/TheBreadcrumb.vue';
import { computed } from 'vue';
import { isEmbed } from '../store';

const items = computed(() => breadcrumbItems.flatMap((bi) => bi.value));
</script>
