<!-- eslint-disable vue/no-mutating-props -->
<template>
  <ArgInput v-model="value[0]" :item="item" :readonly="readonly" />
  {{ t('advancedSearch.matchWord.AND') }}
  <ArgInput v-model="value[1]" :item="item" :readonly="readonly" />
</template>

<script setup lang="ts">
import type { RuleValue } from '@beabee/beabee-common';

import { useI18n } from 'vue-i18n';

import type { FilterItem } from '../../../type/search';
import ArgInput from './ArgInput.vue';

const { t } = useI18n();

/**
 * Between arguments operator component for rules that take two input values (e.g., between X and Y).
 * Now uses internal i18n for the "and" connector and ArgInput handles its own labels.
 *
 * @param value - Array containing the two values for the range
 * @param item - The filter item configuration
 * @param readonly - Whether the component is in readonly mode
 */

interface Props {
  value: RuleValue[];
  item: FilterItem;
  readonly: boolean;
}

defineProps<Props>();
</script>
