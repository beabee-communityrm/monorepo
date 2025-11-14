<route lang="yaml">
name: adminEmailsTemplates
meta:
  role: admin
  pageTitle: emails.tabs.templates
</route>

<template>
  <div class="space-y-6">
    <section
      v-for="group in groupedTemplates"
      :key="group.type"
      class="space-y-4"
    >
      <h2 class="text-xl font-semibold">
        {{ t(`emails.templates.type.${group.type}`) }}
      </h2>
      <div class="space-y-4">
        <div
          v-for="template in group.templates"
          :key="template.id"
          class="rounded border border-primary-20 p-4"
        >
          <div
            class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
          >
            <div class="flex-1">
              <h3 class="text-lg font-semibold">
                {{ t(`emails.templates.names.${template.id}`) }}
              </h3>
            </div>
            <div class="flex-0 sm:ml-4">
              <label :for="`template-${template.id}`" class="sr-only">
                {{ t('emails.templates.selectOverride') }}
              </label>
              <select
                :id="`template-${template.id}`"
                :value="template.overrideEmailId || ''"
                class="form-select w-full sm:w-auto"
                @change="
                  handleAssignment(
                    template.id,
                    ($event.target as HTMLSelectElement).value
                  )
                "
              >
                <option value="">{{ t('emails.templates.useDefault') }}</option>
                <option
                  v-for="email in customEmails"
                  :key="email.id"
                  :value="email.id"
                >
                  {{ email.name }}
                </option>
              </select>
            </div>
          </div>

          <div
            v-if="template.mergeFields.length > 0"
            class="text-xs text-body-60"
          >
            <strong>{{ t('emails.templates.availableFields') }}:</strong>
            <span v-for="(field, index) in template.mergeFields" :key="field">
              *|{{ field }}|*<span
                v-if="index < template.mergeFields.length - 1"
                >,
              </span>
            </span>
          </div>

          <div v-if="template.overrideEmailId" class="mt-3 flex gap-2">
            <AppButton
              size="sm"
              variant="link"
              :to="`/admin/emails/edit/${template.overrideEmailId}`"
            >
              {{ t('emails.actions.editEmail') }}
            </AppButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import type {
  GetEmailTemplateInfoData,
  GetEmailWithMetadataData,
} from '@beabee/beabee-common';
import { AppButton } from '@beabee/vue';
import { addNotification } from '@beabee/vue/store/notifications';

import { client } from '@utils/api';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const templates = ref<GetEmailTemplateInfoData[]>([]);
const customEmails = ref<GetEmailWithMetadataData[]>([]);

/**
 * Group templates by type
 * @description Organizes templates into groups by their type (general, admin, contact)
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
  const result = await client.email.list({ limit: 100 });
  customEmails.value = result.items;
});

async function handleAssignment(templateId: string, emailId: string) {
  try {
    await client.email.assignTemplate(templateId, emailId || null);
    // Reload templates to show updated assignment
    templates.value = await client.email.getTemplates();
    addNotification({
      variant: 'success',
      title: t('emails.notifications.templateAssigned'),
    });
  } catch {
    addNotification({
      variant: 'error',
      title: t('notifications.error'),
    });
  }
}
</script>
