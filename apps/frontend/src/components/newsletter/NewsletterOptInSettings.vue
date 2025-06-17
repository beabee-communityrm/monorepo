<template>
  <div class="mb-4">
    <AppInput v-model="title" :label="t('newsletterOptIn.title')" required />
  </div>
  <div class="mb-4">
    <AppRichTextEditor
      v-model="text"
      :label="t('newsletterOptIn.text')"
      :labels="editorLabels"
      required
    />
  </div>
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
  <AppSectionHeading>{{ t('newsletterOptIn.groups.title') }}</AppSectionHeading>
  <div class="content-i18n mb-4" v-html="t('newsletterOptIn.groups.help')" />
  <AppRepeatable
    v-model="groups"
    :new-item="() => ({ id: '', label: '', checked: false })"
    :add-label="t('newsletterOptIn.groups.add')"
  >
    <template #default="{ item }">
      <div class="flex-1">
        <AppInput v-model="item.id" :label="t('common.id')" required />
      </div>
      <div class="flex-1">
        <AppInput v-model="item.label" :label="t('common.label')" required />
      </div>
      <div class="flex-0 flex h-10 items-center self-end">
        <AppCheckbox v-model="item.checked" :label="t('common.default')" />
      </div>
    </template>
  </AppRepeatable>
</template>

<script lang="ts" setup>
import type { NewsletterGroupData } from '@beabee/beabee-common';
import {
  AppCheckbox,
  AppInput,
  AppRepeatable,
  AppRichTextEditor,
  AppSectionHeading,
} from '@beabee/vue';

import { useI18n } from 'vue-i18n';

import { useRichTextEditorLabels } from '../../composables/useRichTextEditorLabels';

const { t } = useI18n();
const editorLabels = useRichTextEditorLabels();

const title = defineModel<string>('title', { default: '' });
const optIn = defineModel<string>('optIn', { default: '' });
const text = defineModel<string>('text', { default: '' });
const groups = defineModel<NewsletterGroupData[]>('groups', {
  default: [],
});
</script>
