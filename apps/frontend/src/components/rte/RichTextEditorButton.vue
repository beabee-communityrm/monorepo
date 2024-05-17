<template>
  <AppButton
    type="button"
    :variant="active ? 'primary' : 'primaryOutlined'"
    size="sm"
  />
</template>

<script lang="ts" setup>
import AppButton from '../button/AppButton.vue';
defineProps<{ active: boolean }>();
</script>
