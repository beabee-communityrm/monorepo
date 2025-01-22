<template>
  <div v-if="isEmbed" class="flex justify-center">
    <router-view />
  </div>
  <div v-else class="relative flex min-h-screen flex-col md:flex-row">
    <TheMenu />
    <main
      id="top"
      class="flex w-full max-w-[1400px] flex-grow flex-col bg-primary-5 p-4 md:p-10"
    >
      <TheBreadcrumb v-if="items.length > 0" :items="items" />
      <router-view />
      <TheFooter />
    </main>
    <div class="hidden flex-1 bg-primary-5 md:block" />
  </div>
</template>

<script lang="ts" setup>
import TheMenu from './menu/TheMenu.vue';
import TheFooter from '../components/TheFooter.vue';
import { breadcrumbItems } from '../store/breadcrumb';
import TheBreadcrumb from '../components/TheBreadcrumb.vue';
import { computed } from 'vue';
import { isEmbed } from '../store';

const items = computed(() => breadcrumbItems.flatMap((bi) => bi.value));
</script>
