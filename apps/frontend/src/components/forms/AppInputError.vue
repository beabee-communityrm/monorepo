<template>
  <p class="mt-1.5 text-xs font-semibold text-danger" role="alert">
    {{ message }}
  </p>
</template>
<script lang="ts" setup>
import { type Ref } from 'vue';

defineProps<{ message: string | Ref<string> }>();
</script>
