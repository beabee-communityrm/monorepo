<!--
  # HomeNewslettersCard
  The newsletter groups the member is subscribed to, on the home page, with a
  link to manage them on the account page. Members can't subscribe from inside
  the app, so the card leaves itself out while loading and when there are no
  groups.
-->
<template>
  <HomeListCard
    v-if="groups?.length || error"
    :title="t('homePage.yourNewsletters')"
    icon="i-lucide-mail"
    :count="
      groups && t('homePage.groupCount', { n: groups.length }, groups.length)
    "
    :items="groups"
    :error="error"
    :item-key="(group) => group.id"
    :interactive="false"
    :footer-label="t('homePage.manageSubscriptions')"
    footer-to="/profile/account?tab=subscriptions"
  >
    <template #default="{ item: group }">
      <p class="text-highlighted">{{ group.label }}</p>
    </template>
  </HomeListCard>
</template>

<script lang="ts" setup>
import type { BaseNewsletterGroupData } from '@beabee/beabee-common';

import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import HomeListCard from '#components/pages/profile/HomeListCard.vue';
import { client } from '#utils/api';

const { t } = useI18n();

const groups = ref<BaseNewsletterGroupData[]>();
const error = ref(false);

onBeforeMount(async () => {
  try {
    groups.value = await client.contact.newsletter.getGroups('me');
  } catch {
    error.value = true;
  }
});
</script>
