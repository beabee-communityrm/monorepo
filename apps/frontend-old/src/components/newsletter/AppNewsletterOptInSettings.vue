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

  ## Usage:
  ```vue
  <AppNewsletterOptInSettings
    v-model:title="newsletterTitle"
    v-model:text="newsletterText"
    v-model:opt-in="newsletterOptIn"
    v-model:groups="newsletterGroups"
  />
  ```
-->
<template>
  <div>
    <!-- Title Configuration -->
    <div class="mb-4">
      <AppInput v-model="title" :label="t('newsletterOptIn.title')" required />
    </div>

    <!-- Text Content Configuration -->
    <div class="mb-4">
      <AppRichTextEditor
        v-model="text"
        :label="t('newsletterOptIn.text')"
        required
      />
    </div>

    <!-- Opt-in Label Configuration -->
    <div class="mb-4">
      <AppInput
        v-model="optIn"
        :label="t('newsletterOptIn.optInLabel')"
        :info-message="
          groups.length > 0 ? t('newsletterOptIn.optInDisabled') : undefined
        "
        :required="groups.length === 0"
        :disabled="groups.length > 0"
      />
    </div>

    <!-- Groups Section -->
    <section>
      <AppSectionHeading>
        {{ t('newsletterOptIn.groups.title') }}
      </AppSectionHeading>

      <div
        class="content-i18n mb-4"
        v-html="t('newsletterOptIn.groups.help')"
      />

      <AppRepeatable
        v-model="groups"
        :new-item="() => ({ id: '', label: '', checked: false })"
        :add-label="t('newsletterOptIn.groups.add')"
      >
        <template #default="{ item }">
          <!-- Group ID -->
          <div class="flex-1">
            <AppSelect
              :model-value="item.id"
              :label="t('common.id')"
              :items="cachedGroups"
              required
              @update:model-value="onSelectionChange(item, $event)"
            />
          </div>

          <!-- Group Label -->
          <div class="flex-1">
            <AppInput
              v-model="item.label"
              :label="t('common.label')"
              required
            />
          </div>

          <!-- Default Checked -->
          <div class="flex h-10 flex-0 items-center self-end">
            <AppCheckbox v-model="item.checked" :label="t('common.default')" />
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
import {
  AppCheckbox,
  AppInput,
  AppRepeatable,
  AppRichTextEditor,
  AppSectionHeading,
  AppSelect,
} from '@beabee/vue';

import { client } from '#utils/api';

import { onBeforeMount } from 'vue';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// When drop-down selection changes, auto-fill group label only for newly added groups
function onSelectionChange(item: NewsletterGroupData, newId: string) {
  // New group
  if (!item.id) {
    // Get correct group label from the list of cached groups
    const cacheGroupMatch = cachedGroups.value.find((g) => g.id === newId);
    if (cacheGroupMatch) {
      item.label = cacheGroupMatch.label;
    }
  }
  item.id = newId;
}

/**
 * Model values for the component configuration
 */
const title = defineModel<string>('title', { default: '' });
const optIn = defineModel<string>('optIn', { default: '' });
const text = defineModel<string>('text', { default: '' });
const groups = defineModel<NewsletterGroupData[]>('groups', {
  default: () => [],
});
const cachedGroups = defineModel<Omit<NewsletterGroupData, 'checked'>[]>(
  'cachedGroups',
  {
    default: () => [],
  }
);

onBeforeMount(async () => {
  cachedGroups.value = await client.integrations.getNewsletterGroups();
});
</script>
