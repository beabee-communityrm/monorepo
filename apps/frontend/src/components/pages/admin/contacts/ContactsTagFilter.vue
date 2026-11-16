<!--
  # ContactsTagFilter
  Dropdown for filtering the contact list by one tag, with a way to clear it
  and a link to manage the tags.
-->
<template>
  <UDropdownMenu :items="items">
    <UButton
      icon="i-lucide-tag"
      trailing-icon="i-lucide-chevron-down"
      :color="tag ? 'primary' : 'neutral'"
      variant="subtle"
    >
      {{ selectedLabel || t('tags.searchTag') }}
    </UButton>
  </UDropdownMenu>
</template>

<script lang="ts" setup>
import type { SelectItem } from '@beabee/vue';

import type { DropdownMenuItem } from '@nuxt/ui';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  /** Every contact tag */
  tagItems: SelectItem<string>[];
}>();

const emit = defineEmits<{
  (event: 'manageTags'): void;
}>();

/** Id of the tag being filtered by, empty for none */
const tag = defineModel<string>({ required: true });

const selectedLabel = computed(
  () => props.tagItems.find((item) => item.id === tag.value)?.label
);

const items = computed<DropdownMenuItem[][]>(() => [
  [
    ...(props.tagItems.length
      ? props.tagItems.map((item) => ({
          type: 'checkbox' as const,
          label: item.label,
          checked: tag.value === item.id,
          onUpdateChecked: (checked: boolean) => {
            tag.value = checked ? item.id : '';
          },
        }))
      : [{ label: t('tags.noTags'), disabled: true }]),
    ...(tag.value
      ? [
          {
            label: t('tags.clearTags-nuxt'),
            color: 'primary' as const,
            class:
              'data-highlighted:before:bg-transparent data-highlighted:underline',
            onSelect: () => (tag.value = ''),
          },
        ]
      : []),
  ],
  [
    {
      label: t('tags.manageTags'),
      icon: 'i-lucide-settings',
      onSelect: () => emit('manageTags'),
    },
  ],
]);
</script>
