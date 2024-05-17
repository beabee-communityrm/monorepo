<route lang="yaml">
name: profileContributionCancel
meta:
  pageTitle: menu.contribution
</route>

<template>
  <PageTitle :title="t('menu.contribution')" />

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
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import PageTitle from '../../../components/PageTitle.vue';
import AppButton from '../../../components/button/AppButton.vue';
import { cancelContribution } from '../../../utils/api/contact';

const { t } = useI18n();
const router = useRouter();

const loading = ref(false);
async function submit() {
  loading.value = true;
  try {
    await cancelContribution('me');
    router.push({
      path: '/profile/contribution',
      query: { cancelled: null },
    });
  } finally {
    loading.value = false;
  }
}
</script>
