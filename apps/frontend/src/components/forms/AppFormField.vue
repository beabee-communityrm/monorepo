<template>
  <div class="mb-4 last:mb-0">
    <slot />
    <div
      v-if="help"
      class="content-i18n mt-2 text-sm text-grey"
      v-html="help"
    />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  help?: string;
}>();
</script>
