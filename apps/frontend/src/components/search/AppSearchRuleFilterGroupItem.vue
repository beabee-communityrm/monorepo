<template>
  <component
    :is="operatorComponents[rule.operator]"
    :value="rule.value"
    :item="item"
    :readonly="readonly"
    :locale="locale"
  />
</template>

<script setup lang="ts">
import type { Rule } from '@beabee/beabee-common';
import type { BaseLocale } from '@beabee/locale';

import type { FilterItem } from '../../type/search';
import BetweenArgs from './operators/BetweenArgs.vue';
import NoArg from './operators/NoArg.vue';
import SingleArg from './operators/SingleArg.vue';

/**
 * Filter group item component that renders the appropriate operator component
 * based on the rule's operator type. Now simplified since operator components
 * handle their own i18n internally.
 *
 * @param rule - The rule object containing field, operator, and value
 * @param item - The filter item configuration
 * @param readonly - Whether the component is in readonly mode
 * @param locale - Locale for date formatting
 */

interface Props {
  rule: Rule;
  item: FilterItem;
  readonly?: boolean;
  locale?: BaseLocale;
}

withDefaults(defineProps<Props>(), {
  readonly: false,
  locale: 'en' as BaseLocale,
});

const operatorComponents = {
  equal: SingleArg,
  not_equal: SingleArg,
  contains: SingleArg,
  not_contains: SingleArg,
  begins_with: SingleArg,
  not_begins_with: SingleArg,
  ends_with: SingleArg,
  not_ends_with: SingleArg,
  between: BetweenArgs,
  not_between: BetweenArgs,
  less: SingleArg,
  less_or_equal: SingleArg,
  greater: SingleArg,
  greater_or_equal: SingleArg,
  is_empty: NoArg,
  is_not_empty: NoArg,
} as const;
</script>
