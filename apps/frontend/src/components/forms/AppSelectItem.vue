<template>
  <option :key="item.id" :value="item.id">
    {{ item.label + (item.count ? ' (' + item.count + ')' : '') }}
  </option>
</template>
<script lang="ts" setup>
import type { SelectItem } from './form.interface';

defineProps<{ item: SelectItem }>();
</script>
