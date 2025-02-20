<template>
  <div class="mb-4 last:mb-0">
    <slot />
    <div v-if="help" class="content-i18n mt-2 text-sm" v-html="help" />
  </div>
</template>

<script lang="ts" setup>
export interface AppFormFieldProps {
  /** The help text for the form field */
  help?: string;
}

defineProps<AppFormFieldProps>();
</script>
