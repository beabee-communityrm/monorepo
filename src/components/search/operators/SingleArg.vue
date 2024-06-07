<!-- eslint-disable vue/no-mutating-props -->
<template>
  <ArgInput v-model="value[0]" :item="item" :readonly="readonly" />
</template>
<script lang="ts" setup>
import type { RuleValue } from '@beabee/beabee-common';
import type { FilterItem } from '@type';
import ArgInput from './ArgInput.vue';
defineProps<{ value: RuleValue[]; item: FilterItem; readonly: boolean }>();
</script>
