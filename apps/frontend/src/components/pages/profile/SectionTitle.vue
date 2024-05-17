<template>
  <div class="mb-6 flex h-8 items-center md:hidden">
    <span class="h-px flex-grow bg-primary-20" />
    <h2
      class="px-3 text-center text-sm font-semibold uppercase text-primary-40"
    >
      <slot />
    </h2>
    <span class="h-px flex-grow bg-primary-20" />
  </div>
  <AppHeading class="hidden md:block"><slot /></AppHeading>
</template>
<script lang="ts" setup>
import AppHeading from '../../../components/AppHeading.vue';
</script>
