<!-- eslint-disable vue/no-mutating-props -->
<template>
  <ArgInput
    v-model="value[0]"
    :item="item"
    :readonly="readonly"
    :labels="labels"
    :locale="locale"
  />
  {{ labels.and }}
  <ArgInput
    v-model="value[1]"
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
 * Between arguments operator component for rules that take two input values (e.g., between X and Y)
 * @param value - Array containing the two values for the range
 * @param item - The filter item configuration
 * @param readonly - Whether the component is in readonly mode
 * @param labels - Labels for UI text including the "and" connector
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
    and: string;
  };
  locale?: BaseLocale;
}

withDefaults(defineProps<Props>(), {
  locale: 'en' as BaseLocale,
});
</script>
