<route lang="yaml">
name: adminSettingsIntegrations
meta:
  pageTitle: menu.adminSettings
  role: admin
</route>

<template>
  <div class="mt-3 space-y-8">
    <section
      v-for="(items, category) in integrationsByCategory"
      :key="category"
    >
      <AppSectionHeading class="mb-3">{{
        t(`adminSettings.integrations.categories.${category}`)
      }}</AppSectionHeading>

      <div class="space-y-4">
        <IntegrationCard
          v-for="integration in items"
          :key="integration.id"
          :integration="integration"
        >
          <MailchimpCardContent
            v-if="
              integration.id === 'mailchimp' &&
              integration.status === 'connected'
            "
            :audience-id="integration.audienceId"
            :groups="integration.groups"
          />
        </IntegrationCard>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { AppSectionHeading } from '@beabee/vue';
import { faMailchimp } from '@fortawesome/free-brands-svg-icons';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import IntegrationCard from '#components/integrations/IntegrationCard.vue';
import MailchimpCardContent from '#components/integrations/MailchimpCardContent.vue';
import type { Integration } from '#type/integration';

const { t } = useI18n();

// TODO: replace with API call
const integrations: Integration[] = [
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing',
    category: 'newsletters',
    status: 'connected',
    color: '#FFE01B',
    icon: faMailchimp,
    audienceId: 'a1b2c3d4e5',
    groups: [
      { name: 'Newsletter subscribers', id: 'grp_1029384756' },
      { name: 'Onboarding sequence', id: 'grp_5647382910' },
      { name: 'Weekly digest', id: 'grp_0918273645' },
      { name: 'Re-engagement', id: 'grp_3746251809' },
    ],
  },
];

const integrationsByCategory = computed(() =>
  integrations.reduce<Record<string, Integration[]>>((acc, integration) => {
    (acc[integration.category] ??= []).push(integration);
    return acc;
  }, {})
);
</script>
