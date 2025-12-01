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

    <EmailEditor
      v-if="showOneTimeDonationEmail && oneTimeDonationEmail !== undefined"
      :label="stepT('oneTimeDonationEmail')"
      :email="oneTimeDonationEmail"
      :footer="emailFooter"
    />
  </AppForm>
</template>
<script lang="ts" setup>
import { type ContentJoinData, type GetEmailData } from '@beabee/beabee-common';
import { App2ColGrid, AppForm } from '@beabee/vue';

import EmailEditor from '@components/pages/admin/membership-builder/EmailEditor.vue';
import { client, isApiError } from '@utils/api';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const stepT = (key: string) => t('membershipBuilder.steps.emails.' + key);

const welcomeEmail = ref<GetEmailData | false>();
const cancellationEmail = ref<GetEmailData | false>();
const oneTimeDonationEmail = ref<GetEmailData | false>();
const emailFooter = ref('');
const joinContent = ref<ContentJoinData>();

const showOneTimeDonationEmail = computed(() =>
  joinContent.value?.periods.some((p) => p.name === 'one-time')
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
  if (oneTimeDonationEmail.value) {
    await client.email.update('one-time-donation', oneTimeDonationEmail.value);
  }
}

onBeforeMount(async () => {
  welcomeEmail.value = await loadEmail('welcome');
  cancellationEmail.value = await loadEmail('cancelled-contribution');
  oneTimeDonationEmail.value = await loadEmail('one-time-donation');
  emailFooter.value = (await client.content.get('email')).footer;

  joinContent.value = await client.content.get('join');
});
</script>
