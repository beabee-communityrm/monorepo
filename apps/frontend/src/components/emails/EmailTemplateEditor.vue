<template>
  <App2ColGrid>
    <template #col1>
      <AppSelect
        v-if="showSelectTemplate"
        v-model="selectedTemplateId"
        class="mb-4"
        :label="t('contacts.sendEmail.templateLabel')"
        :items="templateSelectItems"
        :placeholder="t('contacts.sendEmail.newEmail')"
        @update:model-value="onTemplateChange"
      />
      <div class="mb-4">
        <AppInput
          v-model="email.name"
          :label="t('contacts.sendEmail.templateName')"
          :placeholder="defaultNewTemplateName"
          :disabled="!isNewEmailSelected"
          required
        />
      </div>
    </template>
  </App2ColGrid>

  <EmailEditor
    v-model:subject="email.subject"
    v-model:content="email.body"
    v-model:preview-contact-id="previewContactId"
    :heading="t('emailEditor.body.label')"
    :preview-contact-options="contacts"
    class="mb-4"
  />
</template>

<script lang="ts" setup>
import type {
  GetContactData,
  GetEmailData,
  UpdateEmailData,
} from '@beabee/beabee-common';
import { App2ColGrid, AppInput, AppSelect, addNotification } from '@beabee/vue';

import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import EmailEditor from '#components/emails/EmailEditor.vue';
import { client } from '#utils/api';
import { extractErrorText } from '#utils/api-error';

const { t } = useI18n();

const NEW_EMAIL_VALUE = '__new__';
const TEMPLATES_LIMIT = 100;

const email = defineModel<UpdateEmailData>('email', { required: true });
const selectedEmailId = defineModel<string | undefined>('selectedEmailId');

const props = withDefaults(
  defineProps<{
    showSelectTemplate?: boolean;
    contacts?: GetContactData[];
    defaultNewTemplateName?: string;
  }>(),
  {
    showSelectTemplate: false,
    contacts: () => [],
    defaultNewTemplateName: '',
  }
);

/** Template Management **/
const templates = ref<GetEmailData[]>([]);
const selectedTemplateId = ref<string>(NEW_EMAIL_VALUE);
const previewContactId = ref<string>('');

const isNewEmailSelected = computed(
  () => selectedTemplateId.value === NEW_EMAIL_VALUE
);

const templateSelectItems = computed(() => {
  const newOption = {
    id: NEW_EMAIL_VALUE,
    label: t('contacts.sendEmail.newEmail'),
  };
  const templateItems = templates.value.map((email) => ({
    id: email.id,
    label: email.name,
  }));
  return [newOption, ...templateItems];
});

async function loadTemplates() {
  const result = await client.email.list({
    limit: TEMPLATES_LIMIT,
    offset: 0,
  });
  templates.value = result.items;
}

function onTemplateChange(value: string) {
  if (value === NEW_EMAIL_VALUE) {
    selectedEmailId.value = undefined;
    email.value = { name: props.defaultNewTemplateName, subject: '', body: '' };
    return;
  }
  const template = templates.value.find((e) => e.id === value);
  if (template) {
    selectedEmailId.value = template.id;
    email.value = {
      name: template.name,
      subject: template.subject,
      body: template.body,
    };
  }
}

onMounted(async () => {
  if (!props.showSelectTemplate) {
    return;
  }
  try {
    await loadTemplates();
  } catch (err) {
    addNotification({
      variant: 'error',
      title: extractErrorText(err),
    });
  }
});
</script>
