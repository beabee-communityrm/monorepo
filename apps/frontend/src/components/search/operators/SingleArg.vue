<!-- eslint-disable vue/no-mutating-props -->
<template>
  <ArgInput v-model="value[0]" :item="item" :readonly="readonly" />
</template>

<script setup lang="ts">
import type { RuleValue } from '@beabee/beabee-common';

import type { FilterItem } from '../../../type/search';
import ArgInput from './ArgInput.vue';

/**
 * Single argument operator component for rules that take one input value.
 * Now simplified since ArgInput uses internal i18n.
 *
 * @param value - Array containing the single value
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
