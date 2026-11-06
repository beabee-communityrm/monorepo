<!--
  # ContactAppliedFilters
  The filters currently applied to the contact list, as removable chips: the
  tag filter, then the rules joined by their group's condition. The default
  slot sits at the end of the bar, for actions such as saving a segment.
-->
<template>
  <div
    class="flex flex-wrap items-center gap-2 border-b border-default bg-elevated/40 p-3"
  >
    <span
      v-if="tagLabel"
      class="flex items-center gap-1.5 rounded-full border border-default bg-default py-1 pr-1 pl-3"
    >
      <span>
        <b class="font-semibold">{{ t('contacts.data.tags') }}</b>
        {{ tagLabel }}
      </span>
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="xs"
        :aria-label="t('advancedSearch.removeFilter-nuxt')"
        @click="emit('removeTag')"
      />
    </span>

    <template v-for="(rule, i) in ruleGroup?.rules ?? []" :key="i">
      <span v-if="tagLabel || i > 0" class="font-semibold text-muted uppercase">
        {{
          t(
            `advancedSearch.matchWord.${i === 0 ? 'AND' : ruleGroup?.condition}`
          )
        }}
      </span>
      <ContactFilterChip
        :rule="rule"
        :filter-groups="filterGroups"
        @remove="emit('removeRule', i)"
      />
    </template>

    <div v-if="$slots.default" class="ml-auto">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { RuleGroup } from '@beabee/beabee-common';

import { useI18n } from 'vue-i18n';

import type { FilterGroups } from '#type';

import ContactFilterChip from './ContactFilterChip.vue';

const { t } = useI18n();

defineProps<{
  /** Label of the tag being filtered by, if any. It's always ANDed with the rules */
  tagLabel?: string;
  /** The applied rules */
  ruleGroup?: RuleGroup;
  /** All available filter groups, to label each rule */
  filterGroups: FilterGroups;
}>();

const emit = defineEmits<{
  (event: 'removeTag'): void;
  (event: 'removeRule', index: number): void;
}>();
</script>
