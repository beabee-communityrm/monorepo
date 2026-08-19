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
    <AppFormSkeleton v-if="loading" :rows="2" />
    <template v-else>
      <p v-if="groups.length === 0" class="text-muted">
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
import { AppFormSkeleton, AppSectionCard } from '@beabee/vue';

import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useApiSubmit } from '#composables/useApiSubmit';
import type { NewsletterGroup } from '#type/newsletter-group';
import { client } from '#utils/api';

const { t } = useI18n();

const loading = ref(true);
const removingId = ref<string | null>(null);
const groups = ref<NewsletterGroup[]>([]);

onMounted(async () => {
  groups.value = await client.contact.newsletter.getGroups('me');
  loading.value = false;
});

async function handleUnsubscribe(group: NewsletterGroup) {
  removingId.value = group.id;
  const { submit } = useApiSubmit(
    async () => {
      await client.contact.newsletter.unsubscribe('me', group.id);
      groups.value = groups.value.filter((g) => g.id !== group.id);
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
