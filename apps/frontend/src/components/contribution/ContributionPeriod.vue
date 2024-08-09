<template>
  <AppChoice
    :model-value="modelValue"
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
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
<script lang="ts" setup>
import { ContributionPeriod } from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';

import AppChoice from '@components/forms/AppChoice.vue';

defineEmits<{ (evt: 'update:modelValue', value: ContributionPeriod): void }>();
defineProps<{ modelValue: ContributionPeriod }>();

const { t } = useI18n();
</script>
