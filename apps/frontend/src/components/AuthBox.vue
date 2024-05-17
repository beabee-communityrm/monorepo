<template>
  <div
    class="max-w-lg"
    :class="{
      'rounded-md bg-white p-6 shadow-auth-box md:p-8': !isEmbed,
      'mx-auto gap-8 md:flex md:max-w-3xl': !preview,
    }"
  >
    <div
      v-if="!isEmbed"
      class="mb-4 flex-initial basis-64"
      :class="{ 'md:mb-0': !preview }"
    >
      <div
        class="flex items-center justify-center gap-4"
        :class="{
          'mb-4': !!$slots.header,
          'md:flex-col md:items-start': !preview,
        }"
      >
        <AppLogo
          :class="{ [title ? 'w-20' : 'w-40']: true, 'md:w-full': !preview }"
        />
        <AppTitle v-if="title" class="flex-1">{{ title }}</AppTitle>
      </div>
      <slot name="header" />
    </div>
    <div class="flex-1">
      <slot />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { isEmbed } from '../store';
import AppLogo from './AppLogo.vue';
import AppTitle from './AppTitle.vue';

defineProps<{ title?: string; preview?: boolean }>();
</script>
