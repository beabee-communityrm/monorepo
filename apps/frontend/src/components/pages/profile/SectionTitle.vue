<template>
  <div class="mb-6 flex h-8 items-center md:hidden">
    <span class="h-px grow bg-main-20" />
    <h2
      class="px-3 text-center text-sm font-semibold text-main-40 uppercase"
    >
      <slot />
    </h2>
    <span class="h-px grow bg-main-20" />
  </div>
  <AppHeading class="hidden md:block"><slot /></AppHeading>
</template>
<script lang="ts" setup>
import { AppHeading } from '@beabee/vue';
</script>
