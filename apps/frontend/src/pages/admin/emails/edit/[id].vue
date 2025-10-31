<route lang="yaml">
name: adminEmailsEdit
meta:
  pageTitle: menu.emails
  role: admin
</route>

<template>
  <template v-if="email && emailData">
    <PageTitle
      :title="t('editEmail.title', { title: emailData.name })"
      border
    />

    <AppForm
      :button-text="t('actions.save')"
      :success-text="t('emails.saved')"
      @submit="handleSubmit"
    >
      <div class="mb-6">
        <AppInput
          v-model="emailData.name"
          :label="t('emails.form.name')"
          required
        />
      </div>

      <EmailEditor
        v-model:template="emailTemplate"
        :always-stacked="false"
        :server-render="serverRenderConfig"
        :merge-field-groups="mergeFieldGroups"
      />

      <div v-if="systemEmailTemplates.length > 0" class="mt-8">
        <AppSubHeading>{{ t('emails.form.systemOverrides') }}</AppSubHeading>
        <p class="mb-4 text-sm text-body-80">
          {{ t('emails.form.systemOverridesHelp') }}
        </p>

        <div
          v-for="(templateId, index) in systemEmailTemplates"
          :key="index"
          class="mb-4 flex items-center gap-4"
        >
          <div class="flex-1">
            <AppSelect
              v-model="systemEmailTemplates[index]"
              :items="availableSystemEmailTemplateItems"
              :placeholder="t('emails.form.selectSystemEmail')"
            />
          </div>
          <AppButton
            :icon="faTrash"
            variant="dangerOutlined"
            :title="t('actions.delete')"
            @click="removeSystemEmailTemplate(index)"
          />
        </div>

        <AppButton
          :icon="faPlus"
          variant="primaryOutlined"
          @click="addSystemEmailTemplate"
        >
          {{ t('emails.form.addSystemOverride') }}
        </AppButton>
      </div>
    </AppForm>
  </template>
</template>

<script lang="ts" setup>
import type {
  EmailTemplateMetadata,
  GetEmailData,
} from '@beabee/beabee-common';
import {
  AppButton,
  AppForm,
  AppInput,
  AppSelect,
  AppSubHeading,
  PageTitle,
  type SelectItem,
  addNotification,
} from '@beabee/vue';

import EmailEditor from '@components/pages/admin/membership-builder/EmailEditor.vue';
import { faEnvelope, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import type {
  EditableEmailTemplate,
  EmailServerRenderConfig,
} from '@type/email-editor';
import { client } from '@utils/api';
import { computed, onBeforeMount, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { useEmailTemplates } from '../../../../composables/useEmailTemplates';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const emailTemplates = useEmailTemplates();

/**
 * Safely get the 'id' parameter from the route
 * The route name might not be in the typed routes yet, so we use a type-safe approach
 */
function getEmailId(): string {
  // Access params using bracket notation to avoid TypeScript union type issues
  // Route params can be string | string[], but for dynamic segments they're always string
  const params = route.params as Record<string, string | string[]>;
  const id = params['id'];

  if (typeof id !== 'string') {
    throw new Error('Email ID parameter is missing or invalid');
  }
  return id;
}

interface EmailFormData {
  name: string;
}

const email = ref<GetEmailData | undefined>();
const emailData = reactive<EmailFormData>({
  name: '',
});

const emailTemplate = ref<EditableEmailTemplate>({
  subject: '',
  content: '',
});

// System email template overrides
const systemEmailTemplates = ref<string[]>([]);

// Available system email templates (loaded from backend)
const availableSystemEmailTemplateItems = computed<SelectItem<string>[]>(() =>
  emailTemplates.templates.value.map((template: EmailTemplateMetadata) => ({
    id: template.id,
    label: template.name,
  }))
);

// System template ID (from the loaded email)
const systemTemplateId = computed(() => email.value?.systemTemplateId);

// Check if the current email is a system template override
const isSystemTemplate = computed(() => {
  return email.value?.isSystem === true && !!systemTemplateId.value;
});

// Get server render config for system templates
const serverRenderConfig = computed<EmailServerRenderConfig | undefined>(() => {
  if (!isSystemTemplate.value || !systemTemplateId.value) return undefined;

  const templateType = emailTemplates.getTemplateType(systemTemplateId.value);

  return templateType
    ? {
        type: templateType,
        templateId: systemTemplateId.value,
      }
    : undefined;
});

// Get merge field groups for the EmailEditor
const mergeFieldGroups = computed(() => {
  if (!isSystemTemplate.value || !systemTemplateId.value) return undefined;

  return emailTemplates.getMergeFieldGroups(systemTemplateId.value);
});

addBreadcrumb(
  computed(() => {
    // Safely get the ID - return minimal breadcrumb if not available yet
    const params = route.params as Record<string, string | string[]>;
    const id = params['id'];

    if (typeof id !== 'string') {
      return [
        { title: t('menu.emails'), to: '/admin/emails', icon: faEnvelope },
      ];
    }

    return [
      { title: t('menu.emails'), to: '/admin/emails', icon: faEnvelope },
      {
        title: emailData.name || '',
        to: '/admin/emails/edit/' + id,
      },
      { title: t('actions.edit') },
    ];
  })
);

onBeforeMount(async () => {
  // Load template metadata and email data in parallel
  const [, emailDataResult] = await Promise.all([
    emailTemplates.loadTemplates(),
    client.email.get(getEmailId()),
  ]);

  email.value = emailDataResult;

  // Validate that this is a system template override
  if (!email.value?.isSystem || !email.value?.systemTemplateId) {
    addNotification({
      variant: 'error',
      title: t('emails.errors.notSystemTemplate'),
    });
    router.push({ path: '/admin/emails' });
    return;
  }

  if (email.value) {
    emailData.name = email.value.name;
    emailTemplate.value = {
      subject: email.value.subject,
      content: email.value.body,
    };
  }
});

function addSystemEmailTemplate() {
  systemEmailTemplates.value.push('');
}

function removeSystemEmailTemplate(index: number) {
  systemEmailTemplates.value.splice(index, 1);
}

async function handleSubmit() {
  const id = getEmailId();

  await client.email.update(id, {
    subject: emailTemplate.value.subject,
    body: emailTemplate.value.content,
  });

  addNotification({
    variant: 'success',
    title: t('emails.updated'),
  });

  router.push({ path: '/admin/emails' });
}
</script>
