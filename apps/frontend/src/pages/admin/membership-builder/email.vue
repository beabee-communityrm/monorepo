<route lang="yaml">
name: adminMembershipBuilderEmail
meta:
  pageTitle: membershipBuilder.title
  role: admin
</route>

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
    <EmailEditor
      v-if="welcomeEmail !== undefined"
      :label="stepT('welcomeEmail')"
      :email="welcomeEmail"
      :footer="emailFooter"
    />

    <EmailEditor
      v-if="cancellationEmail !== undefined"
      :label="stepT('cancellationEmail')"
      :email="cancellationEmail"
      :footer="emailFooter"
    />
  </AppForm>
</template>
<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppForm from '@components/forms/AppForm.vue';
import EmailEditor from '@components/pages/admin/membership-builder/EmailEditor.vue';
import App2ColGrid from '@components/App2ColGrid.vue';

import { fetchContent } from '@utils/api/content';
import { fetchEmail, updateEmail } from '@utils/api/email';
import { isRequestError } from '@utils/api';

import type { GetEmailData } from '@type';

const { t } = useI18n();
const stepT = (key: string) => t('membershipBuilder.steps.emails.' + key);

const welcomeEmail = ref<GetEmailData | false>();
const cancellationEmail = ref<GetEmailData | false>();
const emailFooter = ref('');

async function loadEmail(id: string): Promise<GetEmailData | false> {
  try {
    return await fetchEmail(id);
  } catch (err) {
    if (isRequestError(err, ['external-email-template'])) {
      return false;
    }
    return { body: '', subject: '' };
  }
}

async function handleUpdate() {
  if (welcomeEmail.value) {
    await updateEmail('welcome', welcomeEmail.value);
  }
  if (cancellationEmail.value) {
    await updateEmail('cancelled-contribution', cancellationEmail.value);
  }
}

onBeforeMount(async () => {
  welcomeEmail.value = await loadEmail('welcome');
  cancellationEmail.value = await loadEmail('cancelled-contribution');
  emailFooter.value = (await fetchContent('email')).footer;
});
</script>
