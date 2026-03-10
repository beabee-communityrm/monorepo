<route lang="yaml">
name: profileContributionCancel
meta:
  pageTitle: menu.contribution
</route>

<template>
  <PageTitle :title="t('menu.contribution')" border />

  <h3 class="mb-4 text-2xl font-semibold text-body">
    {{ t('contribution.cancelMessage') }}
  </h3>

  <div class="flex">
    <AppButton to="/profile/contribution" variant="primaryOutlined">
      {{ t('actions.goBack') }}
    </AppButton>

    <AppButton
      class="ml-4"
      variant="danger"
      :loading="loading"
      @click="submit"
      >{{ t('contribution.cancelContribution') }}</AppButton
    >
  </div>
</template>

<script lang="ts" setup>
import { AppButton, PageTitle } from '@beabee/vue';

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { client } from '#utils/api';

const { t } = useI18n();
const router = useRouter();

const loading = ref(false);
async function submit() {
  loading.value = true;
  try {
    await client.contact.contribution.cancel('me');
    router.push({
      path: '/profile/contribution',
      query: { cancelled: null },
    });
  } finally {
    loading.value = false;
  }
}
</script>
