<template>
  <div class="mt-5 grid grid-cols-2 items-end gap-6">
    <div class="col-span-1">
      <slot />
    </div>
    <div class="content-i18n col-span-1 text-sm text-grey" v-html="help" />
  </div>
</template>
<script lang="ts" setup>
defineProps<{ help?: string }>();
</script>
