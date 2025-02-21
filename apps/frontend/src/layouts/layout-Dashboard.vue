<template>
  <div v-if="isEmbed" class="flex h-screen w-full">
    <router-view />
  </div>
  <div v-else class="flex h-screen w-full">
    <TheMenu />
    <main id="top" class="flex w-full flex-1 flex-col bg-primary-5">
      <TheBreadcrumb
        v-if="items.length > 0"
        :items="items"
        class="flex-none p-4 md:p-5"
      />
      <div class="min-h-0 flex-1 p-4 pb-0 md:p-5 md:pb-0">
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
