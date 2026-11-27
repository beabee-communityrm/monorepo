<!--
  # HomeNewslettersCard
  The newsletter groups the member is subscribed to, on the home page, with a
  link to manage them on the account page. Members can't subscribe from inside
  the app, so the card leaves itself out while loading and when there are no
  groups.
-->
<template>
  <HomeListCard
    v-if="groups?.length || failed"
    :title="t('homePage.yourNewsletters')"
    icon="i-lucide-mail"
    :count="
      groups && t('homePage.groupCount', { n: groups.length }, groups.length)
    "
    :items="groups"
    :error="failed"
    :retry="retry"
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
import type { LazyQuery } from '#type';

/** Props for HomeNewslettersCard */
export interface HomeNewslettersCardProps {
  /** The newsletter groups the member is subscribed to */
  query: LazyQuery<BaseNewsletterGroupData[]>;
}

const props = defineProps<HomeNewslettersCardProps>();

const { t } = useI18n();

const { data: groups, failed, retry } = props.query;
</script>
