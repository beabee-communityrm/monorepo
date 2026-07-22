<template>
  <div class="my-12 text-center">
    <p>
      {{ t('callout.membersOnly') }}
      <b>{{ t('callout.updateContribution') }}</b>
    </p>
    <AppButton
      class="mt-4 w-full sm:w-1/2"
      variant="link"
      to="/profile/contribution"
    >
      {{ t('callout.toContributionPage') }}
    </AppButton>
  </div>
</template>
<script lang="ts" setup>
import { AppButton } from '@beabee/vue';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
