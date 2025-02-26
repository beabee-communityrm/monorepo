<template>
  <AppButton
    type="button"
    :variant="active ? 'primary' : 'primaryOutlined'"
    size="sm"
  />
</template>

<script lang="ts" setup>
import { AppButton } from '@beabee/vue';
defineProps<{ active: boolean }>();
</script>
