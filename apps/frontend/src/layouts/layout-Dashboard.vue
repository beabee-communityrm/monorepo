<template>
  <div class="relative flex min-h-screen flex-col md:flex-row">
    <TheMenu v-if="!isEmbed" />

    <main
      id="top"
      class="flex w-full max-w-[1400px] flex-grow flex-col"
      :class="!isEmbed && 'bg-primary-5 p-4 md:p-10'"
    >
      <TheBreadcrumb v-if="!isEmbed && items.length > 0" :items="items" />
      <router-view />
      <TheFooter v-if="!isEmbed" />
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
