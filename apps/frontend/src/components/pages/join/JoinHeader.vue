<template>
  <header class="mb-4 flex">
    <AppLogo class="w-16 flex-none self-start" />
    <div class="ml-4 flex flex-col self-center">
      <AppTitle>{{ title }}</AppTitle>
    </div>
  </header>
</template>
<script lang="ts" setup>
import AppLogo from '../../AppLogo.vue';
import AppTitle from '../../AppTitle.vue';
defineProps<{ title: string }>();
</script>
