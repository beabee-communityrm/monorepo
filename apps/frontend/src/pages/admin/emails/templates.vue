<route lang="yaml">
name: adminEmailsTemplates
meta:
  role: admin
  pageTitle: emails.tabs.templates
</route>

<template>
  <div class="space-y-8">
    <section
      v-for="group in groupedTemplates"
      :key="group.type"
      class="space-y-4"
    >
      <h2 class="text-xl font-semibold">
        {{ t(`emails.templates.type.${group.type}`) }}
      </h2>
      <AppTable :headers="headers" :items="group.templates" class="w-full">
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
          <span
            v-if="item.hasOverride"
            class="inline-block rounded bg-warning-10 px-2 py-1 text-xs font-medium text-warning"
          >
            {{ t('emails.customized') }}
          </span>
          <span
            v-else
            class="inline-block rounded bg-primary-5 px-2 py-1 text-xs text-body-60"
          >
            {{ t('emails.default') }}
          </span>
        </template>
      </AppTable>
    </section>
  </div>
</template>

<script lang="ts" setup>
import type { GetEmailTemplateInfoData } from '@beabee/beabee-common';
import { AppTable, type Header } from '@beabee/vue';

import { client } from '@utils/api';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const templates = ref<GetEmailTemplateInfoData[]>([]);

const headers: Header[] = [
  { value: 'name', text: t('emails.name') },
  { value: 'subject', text: t('emailEditor.subject.label') },
  { value: 'status', text: t('emails.status'), align: 'right' },
];

/**
 * Group templates by type (general, contact, admin)
 */
const groupedTemplates = computed(() => {
  const groups: Record<
    string,
    { type: string; templates: GetEmailTemplateInfoData[] }
  > = {};

  for (const template of templates.value) {
    if (!groups[template.type]) {
      groups[template.type] = {
        type: template.type,
        templates: [],
      };
    }
    groups[template.type].templates.push(template);
  }

  // Return in a consistent order: general, contact, admin
  const order = ['general', 'contact', 'admin'];
  return order.filter((type) => groups[type]).map((type) => groups[type]);
});

onMounted(async () => {
  templates.value = await client.email.getTemplates();
});
</script>
