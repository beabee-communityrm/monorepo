<template>
  <App2ColGrid class="mb-8">
    <template #col1>
      <p>{{ stepT('text') }}</p>
    </template>
  </App2ColGrid>

  <AppForm
    :button-text="t('form.saveChanges')"
    :success-text="t('form.saved')"
    @submit="handleUpdate"
  >
    <!-- Transform GetEmailData (body) to EmailEditor format (content) -->
    <!-- Use reactive wrapper objects to enable bidirectional sync -->
    <EmailEditor
      v-if="welcomeEmail"
      :heading="stepT('welcomeEmail')"
      :template="welcomeEmailData"
      :footer="emailFooter"
      :contact="currentUser"
      :subject-label="t('emailEditor.subject.label')"
      :content-label="t('emailEditor.body.label')"
    />

    <EmailEditor
      v-if="cancellationEmail"
      :heading="stepT('cancellationEmail')"
      :template="cancellationEmailData"
      :footer="emailFooter"
      :contact="currentUser"
      :subject-label="t('emailEditor.subject.label')"
      :content-label="t('emailEditor.body.label')"
    />
  </AppForm>
</template>
<script lang="ts" setup>
import type { GetEmailData } from '@beabee/beabee-common';
import { App2ColGrid, AppForm } from '@beabee/vue';

import EmailEditor from '@components/pages/admin/membership-builder/EmailEditor.vue';
// Import current user store
import { currentUser } from '@store/currentUser';
import { client, isApiError } from '@utils/api';
import { onBeforeMount, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const stepT = (key: string) => t('membershipBuilder.steps.emails.' + key);

const welcomeEmail = ref<GetEmailData | false>();
const cancellationEmail = ref<GetEmailData | false>();
const emailFooter = ref('');

// Reactive wrapper objects that transform GetEmailData (body) to EmailEditor format (content)
// These enable bidirectional synchronization between the API format and component format
const welcomeEmailData = reactive({
  subject: '',
  content: '',
});

const cancellationEmailData = reactive({
  subject: '',
  content: '',
});

// Sync welcomeEmail -> welcomeEmailData (API to component)
watch(
  () => welcomeEmail.value,
  (email) => {
    if (email) {
      welcomeEmailData.subject = email.subject;
      welcomeEmailData.content = email.body;
    }
  },
  { immediate: true }
);

// Sync welcomeEmailData -> welcomeEmail (component to API)
watch(
  welcomeEmailData,
  (data) => {
    if (welcomeEmail.value) {
      welcomeEmail.value.subject = data.subject;
      welcomeEmail.value.body = data.content;
    }
  },
  { deep: true }
);

// Sync cancellationEmail -> cancellationEmailData (API to component)
watch(
  () => cancellationEmail.value,
  (email) => {
    if (email) {
      cancellationEmailData.subject = email.subject;
      cancellationEmailData.content = email.body;
    }
  },
  { immediate: true }
);

// Sync cancellationEmailData -> cancellationEmail (component to API)
watch(
  cancellationEmailData,
  (data) => {
    if (cancellationEmail.value) {
      cancellationEmail.value.subject = data.subject;
      cancellationEmail.value.body = data.content;
    }
  },
  { deep: true }
);

async function loadEmail(id: string): Promise<GetEmailData | false> {
  try {
    return await client.email.get(id);
  } catch (err) {
    if (isApiError(err, ['external-email-template'])) {
      return false;
    }
    return { body: '', subject: '' };
  }
}

async function handleUpdate() {
  if (welcomeEmail.value) {
    await client.email.update('welcome', welcomeEmail.value);
  }
  if (cancellationEmail.value) {
    await client.email.update(
      'cancelled-contribution',
      cancellationEmail.value
    );
  }
}

onBeforeMount(async () => {
  welcomeEmail.value = await loadEmail('welcome');
  cancellationEmail.value = await loadEmail('cancelled-contribution');
  emailFooter.value = (await client.content.get('email')).footer;
});
</script>
