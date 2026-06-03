<route lang="yaml">
name: adminSettingsIntegrations
meta:
  pageTitle: menu.adminSettings
  role: admin
</route>

<template>
  <div class="mt-3 space-y-8">
    <AppLoadingSpinner v-if="loading" />

    <template v-else>
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
            :key="integration.provider"
            :integration="integration"
            @refresh="refresh(integration.provider)"
          >
            <MailchimpCardContent
              v-if="
                integration.provider === 'mailchimp' &&
                integration.status === 'connected'
              "
              :audience-id="integration.audienceId"
              :groups="integration.groups"
            />
          </IntegrationCard>
        </div>
      </section>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { AppLoadingSpinner, AppSectionHeading } from '@beabee/vue';
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import IntegrationCard from '#components/integrations/IntegrationCard.vue';
import MailchimpCardContent from '#components/integrations/MailchimpCardContent.vue';
import { useNewsletterIntegrations } from '#composables/useNewsletterIntegrations';

const { t } = useI18n();

const { integrations, loading, load, refresh } = useNewsletterIntegrations();

const integrationsByCategory = computed(() =>
  integrations.value.reduce<Record<string, typeof integrations.value>>(
    (acc, integration) => {
      (acc[integration.category] ??= []).push(integration);
      return acc;
    },
    {}
  )
);

onMounted(load);
</script>
