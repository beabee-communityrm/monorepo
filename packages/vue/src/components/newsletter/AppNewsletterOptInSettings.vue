<!--
  # AppNewsletterOptInSettings
  An admin configuration component for setting up newsletter opt-in forms.
  Provides UI for configuring title, text content, opt-in labels, and newsletter groups.

  ## Features
  - Configurable title and rich text content
  - Opt-in label configuration with conditional behavior
  - Newsletter groups management with repeatable fields
  - Rich text editor with customizable labels
  - Responsive form layout
  - Accessibility support with proper labeling
-->
<template>
  <div class="max-w-none space-y-4">
    <!-- Title Configuration -->
    <div class="mb-4">
      <AppInput v-model="title" :label="labels.title" required class="w-full" />
    </div>

    <!-- Text Content Configuration -->
    <div class="mb-4">
      <AppRichTextEditor
        v-model="text"
        :label="labels.text"
        :labels="editorLabels"
        required
        class="w-full"
      />
    </div>

    <!-- Opt-in Label Configuration -->
    <div class="mb-4">
      <AppInput
        v-model="optIn"
        :label="labels.optInLabel"
        :info-message="groups.length > 0 ? labels.optInDisabled : undefined"
        :required="groups.length === 0"
        :disabled="groups.length > 0"
        class="w-full"
      />
    </div>

    <!-- Groups Section -->
    <section class="space-y-4">
      <AppSectionHeading class="mb-3">
        {{ labels.groupsTitle }}
      </AppSectionHeading>

      <div
        v-if="labels.groupsHelp"
        class="mb-4 max-w-none text-sm text-body-80"
        v-html="labels.groupsHelp"
      />

      <AppRepeatable
        v-model="groups"
        :new-item="() => ({ id: '', label: '', checked: false })"
        :add-label="labels.groupsAdd"
        class="space-y-4"
      >
        <template #default="{ item }">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
            <!-- Group ID -->
            <div class="flex-1">
              <AppInput
                v-model="item.id"
                :label="labels.commonId"
                required
                class="min-w-0"
              />
            </div>

            <!-- Group Label -->
            <div class="flex-1">
              <AppInput
                v-model="item.label"
                :label="labels.commonLabel"
                required
                class="min-w-0"
              />
            </div>

            <!-- Default Checked -->
            <div
              class="sm:flex-0 flex h-10 items-center justify-center sm:justify-start"
            >
              <AppCheckbox
                v-model="item.checked"
                :label="labels.commonDefault"
                class="whitespace-nowrap"
              />
            </div>
          </div>
        </template>
      </AppRepeatable>
    </section>
  </div>
</template>

<script lang="ts" setup>
/**
 * Newsletter opt-in settings configuration component.
 * Provides administrative interface for configuring newsletter opt-in forms.
 *
 * @component AppNewsletterOptInSettings
 */
import type { NewsletterGroupData } from '@beabee/beabee-common';

import type { RichTextEditorLabels } from '../form/index';
import {
  AppCheckbox,
  AppInput,
  AppRepeatable,
  AppRichTextEditor,
} from '../form/index';
import { AppSectionHeading } from '../typography/index';

/**
 * Labels for the NewsletterOptInSettings component
 */
export interface AppNewsletterOptInSettingsLabels {
  /** Label for the title input field */
  title: string;
  /** Label for the text editor field */
  text: string;
  /** Label for the opt-in label input field */
  optInLabel: string;
  /** Help text shown when opt-in is disabled due to groups */
  optInDisabled: string;
  /** Title for the groups section */
  groupsTitle: string;
  /** Help text for the groups section (supports HTML) */
  groupsHelp: string;
  /** Label for the add group button */
  groupsAdd: string;
  /** Label for the group ID field */
  commonId: string;
  /** Label for the group label field */
  commonLabel: string;
  /** Label for the default checked checkbox */
  commonDefault: string;
}

/**
 * Props for the AppNewsletterOptInSettings component
 */
export interface AppNewsletterOptInSettingsProps {
  /** Text labels for all UI elements */
  labels: AppNewsletterOptInSettingsLabels;
  /** Labels for the rich text editor toolbar */
  editorLabels: RichTextEditorLabels;
}

const props = defineProps<AppNewsletterOptInSettingsProps>();

/**
 * Model values for the component configuration
 */
const title = defineModel<string>('title', { default: '' });
const optIn = defineModel<string>('optIn', { default: '' });
const text = defineModel<string>('text', { default: '' });
const groups = defineModel<NewsletterGroupData[]>('groups', {
  default: () => [],
});
</script>
