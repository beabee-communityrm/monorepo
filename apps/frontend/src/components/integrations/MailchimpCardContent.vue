<template>
  <div class="space-y-6">
    <div v-if="audienceId" class="text-sm">
      <AppCategoryLabel>
        {{ t('adminSettings.integrations.mailchimp.audienceId') }}
      </AppCategoryLabel>
      <p class="font-mono">{{ audienceId }}</p>
    </div>
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

import type { IntegrationGroup } from '#type/integration';

defineProps<{
  audienceId?: string;
  groups?: IntegrationGroup[];
}>();

const { t } = useI18n();

const groupHeaders: Header[] = [
  { value: 'name', text: 'Group name' },
  { value: 'id', text: 'Group ID' },
];
</script>
