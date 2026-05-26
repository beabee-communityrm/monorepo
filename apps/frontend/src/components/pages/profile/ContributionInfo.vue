<template>
  <div class="flex pt-3">
    <AppInfoList>
      <AppInfoListItem
        :name="t('contacts.data.joined')"
        :value="formatLocale(contact.joined, 'PPP')"
      />
      <AppInfoListItem
        :name="t('contacts.data.contribution')"
        :value="contributingText"
      />
    </AppInfoList>
  </div>
</template>

<script lang="ts" setup>
import { ContributionPeriod, type GetContactData } from '@beabee/beabee-common';
import { AppInfoList, AppInfoListItem, formatLocale } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, n } = useI18n();

const props = defineProps<{
  contact: GetContactData;
}>();

const contributingText = computed(() => {
  if (props.contact.contributionAmount && props.contact.contributionPeriod) {
    return (
      n(props.contact.contributionAmount, 'currency') +
      ' ' +
      (props.contact.contributionPeriod === ContributionPeriod.Monthly
        ? t('common.perMonth')
        : t('common.perYear'))
    );
  } else {
    return undefined;
  }
});
</script>

<style lang="postcss" scoped>
.title {
  @apply -mt-3 mb-3 text-sm font-semibold text-primary-80;
}

.content {
  @apply font-bold;
}
</style>
