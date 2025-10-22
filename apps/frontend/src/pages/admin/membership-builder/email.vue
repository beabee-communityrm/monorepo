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
    <!-- Email editors with automatic API to UI format transformation -->
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
import { onBeforeMount, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const stepT = (key: string) => t('membershipBuilder.steps.emails.' + key);

const welcomeEmail = ref<GetEmailData | false>();
const cancellationEmail = ref<GetEmailData | false>();
const emailFooter = ref('');

// Reactive objects that transform GetEmailData (body) to EmailEditor format (content)
// Using getter/setter for clean bidirectional sync without manual watch functions
const welcomeEmailData = reactive({
  get subject() {
    return welcomeEmail.value && typeof welcomeEmail.value === 'object'
      ? welcomeEmail.value.subject
      : '';
  },
  set subject(value: string) {
    if (welcomeEmail.value && typeof welcomeEmail.value === 'object') {
      welcomeEmail.value.subject = value;
    }
  },
  get content() {
    return welcomeEmail.value && typeof welcomeEmail.value === 'object'
      ? welcomeEmail.value.body
      : '';
  },
  set content(value: string) {
    if (welcomeEmail.value && typeof welcomeEmail.value === 'object') {
      welcomeEmail.value.body = value;
    }
  },
});

const cancellationEmailData = reactive({
  get subject() {
    return cancellationEmail.value &&
      typeof cancellationEmail.value === 'object'
      ? cancellationEmail.value.subject
      : '';
  },
  set subject(value: string) {
    if (
      cancellationEmail.value &&
      typeof cancellationEmail.value === 'object'
    ) {
      cancellationEmail.value.subject = value;
    }
  },
  get content() {
    return cancellationEmail.value &&
      typeof cancellationEmail.value === 'object'
      ? cancellationEmail.value.body
      : '';
  },
  set content(value: string) {
    if (
      cancellationEmail.value &&
      typeof cancellationEmail.value === 'object'
    ) {
      cancellationEmail.value.body = value;
    }
  },
});

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
