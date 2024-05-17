<template>
  <div class="flex pt-3">
    <AppInfoList>
      <AppInfoListItem
        :name="t('common.joined')"
        :value="formatLocale(contact.joined, 'PPP')"
      />
      <AppInfoListItem
        :name="t('common.contributing')"
        :value="
          contact.contributionAmount
            ? n(contact.contributionAmount, 'currency')
            : '–'
        "
      />
    </AppInfoList>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import AppInfoList from '@components/AppInfoList.vue';
import AppInfoListItem from '@components/AppInfoListItem.vue';

import { formatLocale } from '@utils/dates';

import type { GetContactData } from '@type';

const { t, n } = useI18n();

defineProps<{
  contact: GetContactData;
}>();
</script>

<style lang="postcss" scoped>
.title {
  @apply -mt-3 mb-3 text-sm font-semibold text-primary-80;
}

.content {
  @apply font-bold;
}
</style>
