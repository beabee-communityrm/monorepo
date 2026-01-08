<template>
  <AppTable :headers="headers" :items="sortedTemplates" class="w-full">
    <template #value-type="{ item }">
      <span class="text-body-80">
        {{ t(`emails.templates.type.${item.type}`) }}
      </span>
    </template>
    <template #value-name="{ item }">
      <router-link
        :to="`/admin/settings/email/${item.id}`"
        class="text-base font-bold text-link"
      >
        {{ t(`emails.templates.names.${item.id}`) }}
      </router-link>
    </template>
    <template #value-description="{ item }">
      <span class="text-body-80">{{
        t(`emails.templates.description.${item.id}`)
      }}</span>
    </template>
    <template #value-status="{ item }">
      <div class="flex items-center justify-end gap-2 text-xs font-medium">
        <span v-if="item.hasOverride" class="text-body-80">
          {{ t('emails.customized') }}
        </span>
        <span v-else-if="!item.hasDefaultTemplate" class="text-danger">
          {{ t('emails.missingDefault') }}
        </span>
        <span v-else class="text-body-80">
          {{ t('emails.default') }}
        </span>
        <AppRoundBadge
          :type="
            item.hasOverride
              ? 'success'
              : !item.hasDefaultTemplate
                ? 'danger'
                : 'warning'
          "
          size="small"
          :aria-label="
            item.hasOverride
              ? t('emails.customized')
              : !item.hasDefaultTemplate
                ? t('emails.missingDefault')
                : t('emails.default')
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
  { value: 'description', text: t('emails.description') },
  { value: 'status', text: t('emails.status'), align: 'right', width: '10%' },
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
