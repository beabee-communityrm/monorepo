<!--
  # HomeNewslettersCard
  The newsletter groups the member is subscribed to, on the home page, with a
  link to manage them on the account page. Members can't subscribe from inside
  the app, so the page leaves this card out when there are no groups.
-->
<template>
  <HomeListCard
    :title="t('homePage.yourNewsletters')"
    icon="i-lucide-mail"
    :count="t('homePage.groupCount', { n: groups.length }, groups.length)"
    :items="groups"
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

import { useI18n } from 'vue-i18n';

import HomeListCard from '#components/pages/profile/HomeListCard.vue';

defineProps<{
  /** The newsletter groups the member is subscribed to */
  groups: BaseNewsletterGroupData[];
}>();

const { t } = useI18n();
</script>
