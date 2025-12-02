<!--
  # AppMergeFields
  Display available merge fields for email templates in grouped format.
  Merge fields are placeholders (format: *|FIELD_NAME|*) that get replaced with dynamic values.

  ## Features:
  - Grouped display with visual separation
  - Insert action for editor integration
  - Accessible with ARIA labels
  - Responsive design
  - Touch-friendly interface
-->
<template>
  <div class="overflow-hidden rounded-lg border border-grey-light bg-white">
    <!-- Header -->
    <header
      class="sticky top-0 z-10 flex items-center justify-center border-b border-grey-light bg-white px-4 py-3"
    >
      <h3 class="font-title font-semibold text-body">
        {{ t('mergeFields.title') }}
      </h3>
    </header>

    <!-- Content -->
    <div
      class="max-h-80 divide-y divide-grey-light overflow-y-auto"
      role="region"
      :aria-label="t('mergeFields.title')"
    >
      <div v-for="group in groups" :key="group.key" class="px-4 py-3">
        <!-- Group label -->
        <AppCategoryLabel>
          {{ t(`mergeFields.groups.${group.key}`) }}
        </AppCategoryLabel>

        <!-- Merge tags in group -->
        <div class="space-y-3">
          <div
            v-for="tag in group.tags"
            :key="tag.tag"
            class="group flex flex-col gap-1"
          >
            <!-- Tag and actions -->
            <div class="flex items-center justify-between gap-2">
              <code
                class="font-mono flex-1 rounded bg-grey-lighter px-2 py-1 text-sm text-body"
              >
                *|{{ tag.tag }}|*
              </code>

              <!-- Insert button -->
              <AppButton
                variant="primary"
                size="xs"
                :icon="faPlus"
                :name="t('mergeFields.insertTag', { tag: tag.tag })"
                :title="t('mergeFields.insert')"
                class="h-7 w-7"
                @click="handleInsert(tag.tag)"
              />
            </div>

            <!-- Description -->
            <AppHelperText>
              {{ t(`mergeFields.tags.${tag.tag}`) }}
            </AppHelperText>

            <!-- Example value (if provided) -->
            <AppHelperText v-if="tag.example" class="italic text-body-60">
              {{ t('mergeFields.example') }}: {{ tag.example }}
            </AppHelperText>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * Component for displaying and inserting email merge fields in a dropdown.
 * Shows merge tags grouped by category with insert action for editor integration.
 *
 * @component AppMergeFields
 */
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';

import type { MergeTagGroup } from '../../types/merge-fields';
import { AppButton } from '../index';
import { AppCategoryLabel, AppHelperText } from '../typography';

/**
 * Props for the AppMergeFields component
 */
export interface AppMergeFieldsProps {
  /** Grouped merge fields configuration */
  groups: MergeTagGroup[];
}

defineProps<AppMergeFieldsProps>();

/**
 * Events emitted by the AppMergeFields component
 */
const emit = defineEmits<{
  /**
   * Emitted when a merge tag should be inserted
   * @param tag - The tag identifier (without delimiters)
   */
  insert: [tag: string];
}>();

const { t } = useI18n();

/**
 * Handle insert action
 */
function handleInsert(tag: string): void {
  emit('insert', tag);
}
</script>
