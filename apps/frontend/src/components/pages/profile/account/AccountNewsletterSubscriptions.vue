<!--
  # AccountNewsletterSubscriptions
  Member-only ("me") view of the newsletter groups they belong to, with the
  ability to unsubscribe from individual groups. Joining new groups isn't
  supported here (managed externally, e.g. Mailchimp).
-->
<template>
  <AppSectionCard
    icon="i-lucide-mail"
    :title="t('accountPage.newsletter.title')"
    :description="t('accountPage.newsletter.description')"
  >
    <LoadError v-if="failed" :retry="retry" />
    <template v-else-if="groups">
      <p v-if="!groups.length" class="text-muted">
        {{ t('accountPage.newsletter.noGroups') }}
      </p>
      <UAlert
        v-else
        icon="i-lucide-info"
        color="neutral"
        variant="subtle"
        :description="t('accountPage.newsletter.unsubscribeInfo')"
      />
      <div
        v-for="group in groups"
        :key="group.id"
        class="flex items-center justify-between gap-4"
      >
        <p class="font-medium">{{ group.label }}</p>
        <UButton
          variant="outline"
          color="neutral"
          size="xs"
          :loading="removingId === group.id"
          @click="() => handleUnsubscribe(group)"
        >
          {{ t('accountPage.newsletter.unsubscribeButton') }}
        </UButton>
      </div>
    </template>
  </AppSectionCard>
</template>

<script lang="ts" setup>
import type { BaseNewsletterGroupData } from '@beabee/beabee-common';
import { AppSectionCard } from '@beabee/vue';

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import LoadError from '#components/LoadError.vue';
import { newsletterGroupsQuery } from '#components/pages/profile/account/use-account-data';
import { useApiSubmit } from '#composables/useApiSubmit';
import { useLazyQuery } from '#composables/useLazyQuery';
import { queryClient } from '#lib/query';
import { client } from '#utils/api';

const { t } = useI18n();

const removingId = ref<string | null>(null);
const { data: groups, failed, retry } = useLazyQuery(newsletterGroupsQuery);

async function handleUnsubscribe(group: BaseNewsletterGroupData) {
  removingId.value = group.id;
  const { submit } = useApiSubmit(
    async () => {
      await client.contact.newsletter.unsubscribe('me', group.id);
      queryClient.setQueryData(newsletterGroupsQuery.queryKey, (groups) =>
        groups?.filter((g) => g.id !== group.id)
      );
    },
    {
      successMessage: () =>
        t('accountPage.newsletter.unsubscribedNotification', {
          group: group.label,
        }),
    }
  );
  await submit();
  removingId.value = null;
}
</script>
