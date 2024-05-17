<template>
  <div class="grid grid-cols-12 gap-6">
    <div class="col-span-12 md:col-span-6 xl:col-span-4">
      <slot name="col1" />
    </div>
    <div
      v-if="$slots.col2"
      class="col-span-12 md:col-span-6 xl:col-start-6"
      :class="extended ? 'xl:col-end-13' : 'xl:col-end-10'"
    >
      <slot name="col2" />
    </div>
  </div>
</template>
<script lang="ts" setup>
defineProps<{ extended?: boolean }>();
</script>
