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
    class="max-w-[1400px]"
    :button-text="t('form.saveChanges')"
    :success-text="t('form.saved')"
    @submit="handleUpdate"
  >
    <EmailEditor
      v-if="welcomeEmail"
      v-model:subject="welcomeEmail.subject"
      v-model:content="welcomeEmail.body"
      :heading="stepT('welcomeEmail')"
      :merge-field-groups="mergeFieldGroups"
      :template="{ type: 'contact', id: 'welcome' }"
    />

    <EmailEditor
      v-if="cancellationEmail"
      v-model:subject="cancellationEmail.subject"
      v-model:content="cancellationEmail.body"
      :heading="stepT('cancellationEmail')"
      :merge-field-groups="mergeFieldGroups"
      :template="{ type: 'contact', id: 'cancelled-contribution' }"
    />

    <EmailEditor
      v-if="showOneTimeDonationEmail && oneTimeDonationEmail"
      v-model:subject="oneTimeDonationEmail.subject"
      v-model:content="oneTimeDonationEmail.body"
      :heading="stepT('oneTimeDonationEmail')"
      :template="{ type: 'contact', id: 'one-time-donation' }"
    />
  </AppForm>
</template>
<script lang="ts" setup>
import type { ContentJoinData } from '@beabee/beabee-common';
import { App2ColGrid, AppForm, type MergeTagGroup } from '@beabee/vue';

import EmailEditor from '@components/EmailEditor.vue';
import { currentUser, generalContent } from '@store';
import { client, isApiError } from '@utils/api';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const stepT = (key: string) => t('membershipBuilder.steps.emails.' + key);

const welcomeEmail = ref({ subject: '', body: '' });
const cancellationEmail = ref({ subject: '', body: '' });
const oneTimeDonationEmail = ref({ subject: '', body: '' });
const joinContent = ref<ContentJoinData>();

const showOneTimeDonationEmail = computed(() =>
  joinContent.value?.periods.some((p) => p.name === 'one-time')
);

// Merge field groups for the rich text editor dropdown
const mergeFieldGroups = computed<MergeTagGroup[]>(() => {
  const user = currentUser.value;
  const fullName = user
    ? `${user.firstname} ${user.lastname}`.trim()
    : undefined;

  return [
    {
      key: 'contact',
      tags: [
        { tag: 'EMAIL', example: user?.email },
        { tag: 'NAME', example: fullName },
        { tag: 'FNAME', example: user?.firstname },
        { tag: 'LNAME', example: user?.lastname },
      ],
    },
    {
      key: 'standard',
      tags: [
        { tag: 'SUPPORTEMAIL', example: generalContent.value.supportEmail },
        { tag: 'ORGNAME', example: generalContent.value.organisationName },
      ],
    },
  ];
});

async function loadEmail(
  id: string
): Promise<{ subject: string; body: string }> {
  try {
    return await client.email.template.get(id);
  } catch (err) {
    if (isApiError(err, undefined, [404])) {
      return { subject: '', body: '' };
    } else {
      throw err;
    }
  }
}

async function handleUpdate() {
  if (welcomeEmail.value) {
    await client.email.template.update('welcome', {
      subject: welcomeEmail.value.subject,
      body: welcomeEmail.value.body,
    });
  }
  if (cancellationEmail.value) {
    await client.email.template.update('cancelled-contribution', {
      subject: cancellationEmail.value.subject,
      body: cancellationEmail.value.body,
    });
  }
  if (oneTimeDonationEmail.value) {
    await client.email.template.update('one-time-donation', {
      subject: oneTimeDonationEmail.value.subject,
      body: oneTimeDonationEmail.value.body,
    });
  }
}

onBeforeMount(async () => {
  welcomeEmail.value = await loadEmail('welcome');
  cancellationEmail.value = await loadEmail('cancelled-contribution');
  oneTimeDonationEmail.value = await loadEmail('one-time-donation');

  joinContent.value = await client.content.get('join');
});
</script>
