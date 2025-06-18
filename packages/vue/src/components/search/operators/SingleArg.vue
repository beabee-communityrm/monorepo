<!-- eslint-disable vue/no-mutating-props -->
<template>
  <ArgInput
    v-model="value[0]"
    :item="item"
    :readonly="readonly"
    :labels="labels"
    :locale="locale"
  />
</template>

<script setup lang="ts">
import type { RuleValue } from '@beabee/beabee-common';
import type { BaseLocale } from '@beabee/locale';

import type { FilterItem } from '../../../types/search';
import ArgInput from './ArgInput.vue';

/**
 * Single argument operator component for rules that take one input value
 * @param value - Array containing the single value
 * @param item - The filter item configuration
 * @param readonly - Whether the component is in readonly mode
 * @param labels - Labels for UI text
 * @param locale - Locale for date formatting
 */

interface Props {
  value: RuleValue[];
  item: FilterItem;
  readonly: boolean;
  labels: {
    yes: string;
    no: string;
    relativeDatePlaceholder: string;
  };
  locale?: BaseLocale;
}

withDefaults(defineProps<Props>(), {
  locale: 'en' as BaseLocale,
});
</script>
