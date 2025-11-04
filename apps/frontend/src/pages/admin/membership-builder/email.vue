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
    <!-- Email editors with direct v-model binding -->
    <EmailEditor
      v-if="welcomeEmail"
      v-model:subject="welcomeEmail.subject"
      v-model:content="welcomeEmail.body"
      :heading="stepT('welcomeEmail')"
      :footer="emailFooter"
      :contact="currentUser"
      :merge-field-groups="welcomeMergeFieldGroups"
      :subject-label="t('emailEditor.subject.label')"
      :content-label="t('emailEditor.body.label')"
    />

    <EmailEditor
      v-if="cancellationEmail"
      v-model:subject="cancellationEmail.subject"
      v-model:content="cancellationEmail.body"
      :heading="stepT('cancellationEmail')"
      :footer="emailFooter"
      :contact="currentUser"
      :merge-field-groups="cancellationMergeFieldGroups"
      :subject-label="t('emailEditor.subject.label')"
      :content-label="t('emailEditor.body.label')"
    />
  </AppForm>
</template>
<script lang="ts" setup>
import type { GetEmailData } from '@beabee/beabee-common';
import { App2ColGrid, AppForm, type MergeTagGroup } from '@beabee/vue';

import EmailEditor from '@components/pages/admin/membership-builder/EmailEditor.vue';
// Import current user store
import { currentUser } from '@store/currentUser';
import { client, isApiError } from '@utils/api';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const stepT = (key: string) => t('membershipBuilder.steps.emails.' + key);

const welcomeEmail = ref<GetEmailData | false>();
const cancellationEmail = ref<GetEmailData | false>();
const emailFooter = ref('');

// Merge field groups for the rich text editor dropdown
const welcomeMergeFieldGroups = computed<MergeTagGroup[]>(() => {
  const user = currentUser.value;

  return [
    {
      key: 'contact',
      tags: [
        { tag: 'EMAIL', example: user?.email },
        {
          tag: 'NAME',
          example: user
            ? `${user.firstname} ${user.lastname}`.trim()
            : undefined,
        },
        { tag: 'FNAME', example: user?.firstname },
        { tag: 'LNAME', example: user?.lastname },
      ],
    },
    {
      key: 'template',
      tags: [{ tag: 'REFCODE', example: 'ABC123' }],
    },
    {
      key: 'magic',
      tags: [
        { tag: 'LOGINLINK', example: window.location.origin + '/auth/login' },
      ],
    },
  ];
});

const cancellationMergeFieldGroups = computed<MergeTagGroup[]>(() => {
  const user = currentUser.value;

  return [
    {
      key: 'contact',
      tags: [
        { tag: 'EMAIL', example: user?.email },
        {
          tag: 'NAME',
          example: user
            ? `${user.firstname} ${user.lastname}`.trim()
            : undefined,
        },
        { tag: 'FNAME', example: user?.firstname },
        { tag: 'LNAME', example: user?.lastname },
      ],
    },
    {
      key: 'template',
      tags: [
        { tag: 'EXPIRES', example: 'Friday 15th March' },
        { tag: 'MEMBERSHIPID', example: user?.id || 'abc123' },
      ],
    },
    {
      key: 'magic',
      tags: [
        { tag: 'LOGINLINK', example: window.location.origin + '/auth/login' },
      ],
    },
  ];
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
