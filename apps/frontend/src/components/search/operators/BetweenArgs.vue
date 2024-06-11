<!-- eslint-disable vue/no-mutating-props -->
<template>
  <ArgInput v-model="value[0]" :item="item" :readonly="readonly" />
  {{ t('advancedSearch.matchWord.AND') }}
  <ArgInput v-model="value[1]" :item="item" :readonly="readonly" />
</template>
<script lang="ts" setup>
import type { RuleValue } from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';
import type { FilterItem } from '@type';
import ArgInput from './ArgInput.vue';
const { t } = useI18n();
defineProps<{ value: RuleValue[]; item: FilterItem; readonly: boolean }>();
</script>
