<!--
  # AppMergeFields
  Display available merge fields for email templates in grouped, collapsible format.
  Merge fields are placeholders (format: *|FIELD_NAME|*) that get replaced with dynamic values.

  ## Features:
  - Grouped display with visual separation
  - Collapse/expand all groups together
  - Copy to clipboard functionality
  - Insert action for editor integration
  - Accessible with ARIA labels
  - Responsive design
  - Touch-friendly interface
-->
<template>
  <div class="overflow-hidden rounded-lg border border-grey-light bg-white">
    <!-- Header -->
    <header
      :class="[
        'sticky top-0 z-10 flex items-center border-b border-grey-light bg-white px-4 py-3',
        hideToggle ? 'justify-center' : 'justify-between',
      ]"
    >
      <h3 class="font-semibold text-body">
        {{ t('mergeFields.title') }}
      </h3>
      <button
        v-if="!hideToggle"
        type="button"
        class="flex items-center gap-2 text-sm font-medium text-primary-70 transition-colors hover:text-primary-80 focus:outline-none focus:ring-2 focus:ring-primary-70 focus:ring-offset-2"
        :aria-label="
          isExpanded ? t('mergeFields.collapseAll') : t('mergeFields.expandAll')
        "
        :aria-expanded="isExpanded"
        @click="toggleExpanded"
      >
        <span>{{
          isExpanded ? t('mergeFields.collapse') : t('mergeFields.expand')
        }}</span>
        <font-awesome-icon
          :icon="isExpanded ? faChevronUp : faChevronDown"
          class="h-3 w-3"
          aria-hidden="true"
        />
      </button>
    </header>

    <!-- Content -->
    <div
      v-if="isExpanded"
      class="max-h-80 divide-y divide-grey-light overflow-y-auto"
      role="region"
      :aria-label="t('mergeFields.title')"
    >
      <div v-for="group in groups" :key="group.key" class="px-4 py-3">
        <!-- Group title -->
        <h4
          class="mb-3 text-xs font-semibold uppercase tracking-wide text-body-80"
        >
          {{ getGroupLabel(group) }}
        </h4>

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

              <div class="flex items-center gap-1">
                <!-- Copy button -->
                <button
                  v-if="showCopy"
                  type="button"
                  class="flex items-center justify-center rounded p-1 text-primary-70 transition-colors hover:bg-primary-5 hover:text-primary-80 focus:outline-none focus:ring-2 focus:ring-primary-70"
                  :aria-label="t('mergeFields.copyTag', { tag: tag.tag })"
                  :title="t('mergeFields.copy')"
                  @click="handleCopy(tag.tag)"
                >
                  <font-awesome-icon
                    :icon="faCopy"
                    class="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                </button>

                <!-- Insert button -->
                <button
                  v-if="showInsert"
                  type="button"
                  class="flex items-center justify-center rounded p-1 text-primary-70 transition-colors hover:bg-primary-5 hover:text-primary-80 focus:outline-none focus:ring-2 focus:ring-primary-70"
                  :aria-label="t('mergeFields.insertTag', { tag: tag.tag })"
                  :title="t('mergeFields.insert')"
                  @click="handleInsert(tag.tag)"
                >
                  <font-awesome-icon
                    :icon="faPlus"
                    class="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            <!-- Description -->
            <p class="text-xs text-body-80">
              {{ getTagDescription(tag) }}
            </p>

            <!-- Example value (if provided) -->
            <p v-if="tag.example" class="text-xs italic text-body-60">
              {{ t('mergeFields.example') }}: {{ tag.example }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Collapsed state hint -->
    <div v-else class="px-4 py-3 text-center text-sm text-body-60">
      {{ t('mergeFields.clickToExpand') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * Component for displaying and managing email merge fields.
 * Shows merge tags grouped by category with copy and insert actions.
 *
 * @component AppMergeFields
 */
import {
  faChevronDown,
  faChevronUp,
  faCopy,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MergeTag, MergeTagGroup } from '../../types/merge-fields';

/**
 * Props for the AppMergeFields component
 */
export interface AppMergeFieldsProps {
  /** Grouped merge fields configuration */
  groups: MergeTagGroup[];
  /** Whether to show copy button */
  showCopy?: boolean;
  /** Whether to show insert button (for editor integration) */
  showInsert?: boolean;
  /** Whether the component starts expanded */
  defaultExpanded?: boolean;
  /** Whether to hide the expand/collapse button (e.g. for dropdown mode) */
  hideToggle?: boolean;
}

const props = withDefaults(defineProps<AppMergeFieldsProps>(), {
  showCopy: true,
  showInsert: false,
  defaultExpanded: true,
  hideToggle: false,
});

/**
 * Events emitted by the AppMergeFields component
 */
const emit = defineEmits<{
  /**
   * Emitted when a merge tag should be inserted
   * @param tag - The tag identifier (without delimiters)
   */
  insert: [tag: string];
  /**
   * Emitted when a merge tag is copied
   * @param tag - The tag identifier (without delimiters)
   */
  copy: [tag: string];
}>();

const { t } = useI18n();

// Expanded/collapsed state
const isExpanded = ref(props.defaultExpanded);

/**
 * Toggle expand/collapse state
 */
function toggleExpanded(): void {
  isExpanded.value = !isExpanded.value;
}

/**
 * Get translated label for a group
 */
function getGroupLabel(group: MergeTagGroup): string {
  const key = group.labelKey || `mergeFields.groups.${group.key}`;
  return t(key);
}

/**
 * Get translated description for a tag
 */
function getTagDescription(tag: MergeTag): string {
  const key = tag.descriptionKey || `mergeFields.tags.${tag.tag}`;
  return t(key);
}

/**
 * Handle copy action
 */
function handleCopy(tag: string): void {
  const mergeTag = `*|${tag}|*`;

  // Copy to clipboard
  navigator.clipboard
    .writeText(mergeTag)
    .then(() => {
      emit('copy', tag);
    })
    .catch((error) => {
      console.error('Failed to copy merge tag:', error);
    });
}

/**
 * Handle insert action
 */
function handleInsert(tag: string): void {
  emit('insert', tag);
}
</script>
