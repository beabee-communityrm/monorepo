<template>
  <AppButton variant="primaryOutlined" class="lg:justify-start" :icon="icon"
    ><slot></slot
  ></AppButton>
</template>
<script lang="ts" setup>
/**
 * A specialized button component that extends AppButton with a predefined style,
 * primarily used for action items in navigation or toolbars.
 */
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import AppButton from './AppButton.vue';

// Define the component props interface
export interface ActionButtonProps {
  icon: IconDefinition;
}

defineProps<ActionButtonProps>();
</script>
