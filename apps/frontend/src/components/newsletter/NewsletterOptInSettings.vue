<template>
  <div class="mb-4">
    <AppInput v-model="title" :label="t('newsletterOptIn.title')" required />
  </div>
  <div class="mb-4">
    <RichTextEditor
      v-model="text"
      :label="t('newsletterOptIn.text')"
      required
    />
  </div>
  <div class="mb-4">
    <AppInput
      v-model="optIn"
      :label="t('newsletterOptIn.optInLabel')"
      :required="groups.length === 0"
      :disabled="groups.length > 0"
    />
    <AppInputHelp
      v-if="groups.length > 0"
      :message="t('newsletterOptIn.optInDisabled')"
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
import { useI18n } from 'vue-i18n';
import { AppCheckbox } from '@beabee/vue/components';
import AppInput from '../forms/AppInput.vue';
import RichTextEditor from '../rte/RichTextEditor.vue';
import AppInputHelp from '../forms/AppInputHelp.vue';
import AppSectionHeading from '../AppSectionHeading.vue';
import AppRepeatable from '../forms/AppRepeatable.vue';
import type { NewsletterGroupData } from '@beabee/beabee-common';

const { t } = useI18n();

const title = defineModel<string>('title', { default: '' });
const optIn = defineModel<string>('optIn', { default: '' });
const text = defineModel<string>('text', { default: '' });
const groups = defineModel<NewsletterGroupData[]>('groups', {
  default: [],
});
</script>
