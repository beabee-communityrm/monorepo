<template>
  <AppButton
    type="button"
    :variant="active ? 'primary' : 'primaryOutlined'"
    size="sm"
    :disabled="disabled"
  />
</template>

<script lang="ts" setup>
import { AppButton } from '@beabee/vue';

defineProps<{
  active: boolean;
  disabled?: boolean;
}>();
</script>
