<template>
  <div
    class="group relative my-0.5 flex w-auto items-center justify-start rounded px-1 py-2 font-semibold text-body-80 md:w-12 md:justify-center lg:w-auto lg:justify-start"
    :class="isActive ? 'bg-primary-20' : 'hover:bg-primary-5'"
  >
    <font-awesome-icon class="fa-fw inline-block h-4" :icon="icon" size="lg" />

    <span class="ml-2 md:hidden lg:inline-block">{{ title }}</span>
    <span
      class="absolute left-full hidden whitespace-nowrap rounded bg-black px-2 py-1 text-sm text-white md:max-xl:group-hover:block"
    >
      <span
        class="absolute right-full top-1/2 h-0 w-0 -translate-y-1/2 border-y-4 border-r-4 border-y-white/0 border-r-black"
      />
      {{ title }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

defineProps<{
  title: string;
  icon: IconDefinition;
  isActive?: boolean;
}>();
</script>
