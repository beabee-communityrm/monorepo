<template>
  <div class="space-y-6">
    <div v-if="groups?.length">
      <AppCategoryLabel>
        {{ t('adminSettings.integrations.mailchimp.groups') }}
      </AppCategoryLabel>
      <AppTable :headers="groupHeaders" :items="groups">
        <template #value-id="{ item }">
          <span class="font-mono text-sm">{{ item.id }}</span>
        </template>
      </AppTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppCategoryLabel, AppTable } from '@beabee/vue';
import type { Header } from '@beabee/vue';
import { useI18n } from 'vue-i18n';

import type { NewsletterGroupData } from '@beabee/beabee-common';

defineProps<{
  groups?: NewsletterGroupData[];
}>();

const { t } = useI18n();

const groupHeaders: Header[] = [
  { value: 'id', text: 'ID' },
  { value: 'label', text: 'Name' },
];
</script>
