<template>
  <AppChoice
    v-model="period"
    :items="[
      {
        label: t('common.contributionPeriod.monthly'),
        value: ContributionPeriod.Monthly,
      },
      {
        label: t('common.contributionPeriod.annually'),
        value: ContributionPeriod.Annually,
      },
    ]"
    variant="collapsed"
  />
</template>
<script lang="ts" setup>
import { ContributionPeriod } from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';

import AppChoice from '@components/forms/AppChoice.vue';

const period = defineModel<ContributionPeriod>({ required: true });

const { t } = useI18n();
</script>
