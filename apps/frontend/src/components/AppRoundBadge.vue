<template>
  <span
    :class="`inline-block ${iconSize} rounded-full align-middle ${iconColor}`"
  ></span>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    type: 'success' | 'warning' | 'danger';
    size?: 'large';
  }>(),
  { type: 'success', size: 'large' }
);

const iconSize = props.size === 'large' ? `w-4 h-4` : `w-2 h-2`;
const iconColor = computed(() => `bg-${props.type}`);
</script>
