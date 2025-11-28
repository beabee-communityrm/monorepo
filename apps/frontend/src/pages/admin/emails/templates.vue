<route lang="yaml">
name: adminEmailsTemplates
meta:
  role: admin
  pageTitle: emails.tabs.templates
</route>

<template>
  <AppTable :headers="headers" :items="sortedTemplates" class="w-full">
    <template #value-type="{ item }">
      <span class="text-body-80">
        {{ t(`emails.templates.type.${item.type}`) }}
      </span>
    </template>
    <template #value-name="{ item }">
      <router-link
        :to="`/admin/emails/template/${item.id}`"
        class="text-base font-bold text-link"
      >
        {{ t(`emails.templates.names.${item.id}`) }}
      </router-link>
    </template>
    <template #value-subject="{ value }">
      <span class="text-body-80">{{ value }}</span>
    </template>
    <template #value-status="{ item }">
      <div class="flex items-center justify-end gap-2">
        <span v-if="item.hasOverride" class="text-xs font-medium text-body-80">
          {{ t('emails.customized') }}
        </span>
        <span v-else class="text-xs text-body-80">
          {{ t('emails.default') }}
        </span>
        <AppRoundBadge
          :type="item.hasOverride ? 'warning' : 'success'"
          size="small"
          :aria-label="
            item.hasOverride ? t('emails.customized') : t('emails.default')
          "
        />
      </div>
    </template>
  </AppTable>
</template>

<script lang="ts" setup>
import type { GetEmailTemplateInfoData } from '@beabee/beabee-common';
import { AppRoundBadge, AppTable, type Header } from '@beabee/vue';

import { client } from '@utils/api';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const templates = ref<GetEmailTemplateInfoData[]>([]);

const headers: Header[] = [
  { value: 'type', text: t('emails.type') },
  { value: 'name', text: t('emails.name') },
  { value: 'subject', text: t('emailEditor.subject.label') },
  { value: 'status', text: t('emails.status'), align: 'right' },
];

/**
 * Sort templates by type (general, contact, admin) and then by name
 */
const sortedTemplates = computed(() => {
  const typeOrder: Record<string, number> = {
    general: 0,
    contact: 1,
    admin: 2,
  };

  return [...templates.value].sort((a, b) => {
    const typeDiff = (typeOrder[a.type] ?? 999) - (typeOrder[b.type] ?? 999);
    if (typeDiff !== 0) return typeDiff;
    return t(`emails.templates.names.${a.id}`).localeCompare(
      t(`emails.templates.names.${b.id}`)
    );
  });
});

onMounted(async () => {
  templates.value = await client.email.template.list();
});
</script>
