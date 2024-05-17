<template>
  <h1
    class="font-title text-3.5xl/tight"
    :class="[
      big && 'md:text-5xl/tight',
      light ? 'font-light' : 'font-semibold',
      !noMargin && 'mb-3',
    ]"
  >
    <slot />
  </h1>
</template>
<script lang="ts" setup>
defineProps<{ big?: boolean; light?: boolean; noMargin?: boolean }>();
</script>
