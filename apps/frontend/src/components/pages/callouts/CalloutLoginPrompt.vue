<template>
  <div class="my-12">
    <p class="text-center">
      {{ t('callout.membersOnly') }}
    </p>
    <div class="mt-6 flex flex-col gap-4 sm:flex-row">
      <AppButton class="w-full" variant="link" to="/join">
        {{ t('callout.joinNow') }}
      </AppButton>
      <AppButton class="w-full" variant="linkOutlined" to="/auth/login">
        {{ t('callout.loginToYourAccount') }}
      </AppButton>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import AppButton from '../../button/AppButton.vue';
const { t } = useI18n();
</script>
