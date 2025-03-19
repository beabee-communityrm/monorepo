<template>
  <div>
    <!-- Content will be implemented later -->
  </div>
</template>

<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';

// TODO: Add data type
export type ResponseDisplayTabData = object;

export interface ResponseDisplayTabProps {
  status: ItemStatus | undefined;
  isActive: boolean;
  data: ResponseDisplayTabData;
}

defineProps<ResponseDisplayTabProps>();
const emit = defineEmits(['update:error', 'update:validated']);

// Basic validation setup
emit('update:error', false);
emit('update:validated', true);
</script>
