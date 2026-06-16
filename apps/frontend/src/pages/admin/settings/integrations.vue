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
          >
            <NewsletterCardContent
              v-if="
                category === 'newsletters' &&
                integration.status === ApiHealthStatus.HEALTHY
              "
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

import { groupBy } from '@beabee/core/utils/objects';

import IntegrationCard from '#components/integrations/IntegrationCard.vue';
import NewsletterCardContent from '#components/integrations/NewsletterCardContent.vue';
import { useNewsletterIntegrations } from '#composables/useNewsletterIntegrations';
import { ApiHealthStatus } from '@beabee/beabee-common';

const { t } = useI18n();

const { integrations, loading, load } = useNewsletterIntegrations();

const integrationsByCategory = computed(() =>
  groupBy(integrations.value, ({ category }) => category)
);

onMounted(load);
</script>
