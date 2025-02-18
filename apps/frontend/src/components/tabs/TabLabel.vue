<template>
  <span>
    {{ label }}
    <span v-if="count !== undefined" class="ml-1">({{ count }})</span>
  </span>
</template>

<script lang="ts" setup>
interface Props {
  /** Label text to display */
  label: string;
  /** Optional count to display next to label */
  count?: number;
}

defineProps<Props>();
</script>
