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
      v-if="welcomeEmail"
      :label="stepT('welcomeEmail')"
      :email="welcomeEmail"
      :footer="emailFooter"
    />

    <EmailEditor
      v-if="cancellationEmail"
      :label="stepT('cancellationEmail')"
      :email="cancellationEmail"
      :footer="emailFooter"
    />
  </AppForm>
</template>
<script lang="ts" setup>
import type { GetEmailData } from '@beabee/beabee-common';
import { App2ColGrid, AppForm } from '@beabee/vue';

import EmailEditor from '@components/pages/admin/membership-builder/EmailEditor.vue';
import { client, isApiError } from '@utils/api';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const stepT = (key: string) => t('membershipBuilder.steps.emails.' + key);

const welcomeEmail = ref<GetEmailData | false>();
const cancellationEmail = ref<GetEmailData | false>();
const emailFooter = ref('');

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
