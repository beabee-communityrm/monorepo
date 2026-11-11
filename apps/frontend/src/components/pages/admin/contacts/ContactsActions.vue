<!--
  # ContactsActions
  The contact list's actions: export, email the segment, and tag the selected
  contacts. The page carries them out; this decides what's available and why.
-->
<template>
  <div class="flex items-center gap-1">
    <!-- TODO: Add support for exporting selected contacts (instead of all contacts) -->
    <UButton
      icon="i-lucide-download"
      color="neutral"
      variant="ghost"
      :title="t('actions.export')"
      :aria-label="t('actions.export')"
      :disabled="selectedCount > 0"
      @click="emit('export')"
    />

    <!-- TODO: Add support for emailing selected contacts (instead of all contacts) -->
    <UDropdownMenu :items="emailItems">
      <UButton
        icon="i-lucide-mail"
        color="neutral"
        variant="ghost"
        :title="t('actions.sendEmails')"
        :aria-label="t('actions.sendEmails')"
        :aria-describedby="emailUnavailableReason && emailReasonId"
      />
    </UDropdownMenu>
    <span v-if="emailUnavailableReason" :id="emailReasonId" class="sr-only">
      {{ emailUnavailableReason }}
    </span>

    <UDropdownMenu :items="bulkTagItems" :disabled="selectedCount === 0">
      <UButton
        icon="i-lucide-tag"
        color="neutral"
        variant="ghost"
        :disabled="selectedCount === 0"
        :title="
          selectedCount > 0 ? t('tags.toggleTag') : t('tags.selectToTag-nuxt')
        "
        :aria-label="t('tags.toggleTag')"
        :loading="busy"
      />

      <template #item-trailing="{ item }">
        <span v-if="item.count" class="text-muted">
          {{ item.count }}
        </span>
      </template>
    </UDropdownMenu>
  </div>
</template>

<script lang="ts" setup>
import type {
  GetContactDataWith,
  GetContactWith,
  GetSegmentData,
} from '@beabee/beabee-common';
import type { SelectItem } from '@beabee/vue';

import type { DropdownMenuItem } from '@nuxt/ui';

import { computed, useId } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, n } = useI18n();

const props = defineProps<{
  /** Number of contacts selected, across all pages */
  selectedCount: number;
  /** The selected contacts on this page, to show which tags they share */
  selectedPageItems: GetContactDataWith<GetContactWith.Tags>[];
  /** Every contact tag */
  tagItems: SelectItem<string>[];
  /** The segment being shown, if any; only a segment can be emailed */
  currentSegment?: GetSegmentData;
  /** A tag change is being saved */
  busy: boolean;
}>();

const emit = defineEmits<{
  (event: 'export'): void;
  (event: 'toggleTag', tagId: string, successText: string): void;
  (event: 'manageTags'): void;
}>();

/**
 * Emails
 */
const emailReasonId = useId();

/** Why a one-off email can't be sent right now, if it can't */
const emailUnavailableReason = computed(() => {
  if (!props.currentSegment) return t('contacts.sendEmailNoSegment-nuxt');
  if (props.selectedCount > 0) return t('contacts.sendEmailSelection-nuxt');
  return undefined;
});

const emailItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: t('actions.sendOneOffEmail-nuxt'),
      icon: 'i-lucide-send',
      ...(props.currentSegment && !emailUnavailableReason.value
        ? { to: `/admin/contacts/send-email/${props.currentSegment.id}` }
        : { disabled: true, description: emailUnavailableReason.value }),
    },
  ],
  [
    {
      label: t('contacts.emailTemplates.manage'),
      icon: 'i-lucide-settings',
      to: { name: 'adminContactsEmailTemplates' },
    },
  ],
]);

/**
 * Tags
 */
const bulkTagItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: 'label' as const,
      label: t(
        'tags.tagSelected-nuxt',
        { count: n(props.selectedCount) },
        props.selectedCount
      ),
    },
  ],
  props.tagItems.length
    ? props.tagItems.map((tag) => {
        const taggedCount = props.selectedPageItems.filter((contact) =>
          contact.tags?.some((contactTag) => contactTag.id === tag.id)
        ).length;
        const checked =
          taggedCount > 0 && taggedCount === props.selectedPageItems.length;

        return {
          type: 'checkbox' as const,
          label: tag.label,
          checked,
          count: t('tags.countOfSelected-nuxt', {
            count: n(taggedCount),
            total: n(props.selectedPageItems.length),
          }),
          // Keep the menu open so several tags can be toggled in a row
          onSelect: (event: Event) => event.preventDefault(),
          onUpdateChecked: () => handleToggleTag(tag, checked),
        };
      })
    : [{ label: t('tags.noTags'), disabled: true }],
  [
    {
      label: t('tags.manageTags'),
      icon: 'i-lucide-settings',
      onSelect: () => emit('manageTags'),
    },
  ],
]);

function handleToggleTag(tag: SelectItem<string>, isTagged: boolean) {
  emit(
    'toggleTag',
    (isTagged ? '-' : '+') + tag.id,
    t(
      isTagged
        ? 'tags.notifications.removedTag'
        : 'tags.notifications.addedTag',
      { tag: tag.label }
    )
  );
}
</script>
