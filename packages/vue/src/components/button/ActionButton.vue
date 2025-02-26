<template>
  <AppButton variant="primaryOutlined" class="lg:justify-start" :icon="icon"
    ><slot></slot
  ></AppButton>
</template>
<script lang="ts" setup>
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import AppButton from './AppButton.vue';
defineProps<{ icon: IconDefinition }>();
</script>
