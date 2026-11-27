<route lang="yaml">
name: profile
meta:
  pageTitle: homePage.title
</route>

<template>
  <div class="nuxt-page flex flex-col gap-5">
    <h2 class="text-2xl">
      {{ t(greetingKey, { firstName: user.firstname }) }}
    </h2>

    <WelcomeCard
      v-if="showWelcomeMessage && profileContent.introMessage"
      :first-name="user.firstname"
      :last-name="user.lastname"
      :text="profileContent.introMessage"
      @close="removeWelcomeMessage"
    />

    <NoticeContainer />

    <div class="flex flex-col items-start gap-5 md:flex-row">
      <div class="flex w-full min-w-0 flex-1 flex-col gap-5">
        <HomeCalloutsCard :query="callouts" />
        <HomeResponsesCard :query="responses" />
      </div>

      <div class="flex w-full flex-col gap-5 md:w-80 md:shrink-0">
        <HomeContributionCard
          v-if="!generalContent.hideContribution"
          :query="contribution"
        />
        <HomeNewslettersCard :query="newsletters" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ContributionType,
  ItemStatus,
  MembershipStatus,
  PaymentStatus,
} from '@beabee/beabee-common';

import { queryOptions } from '@tanstack/vue-query';

import { routeQuery } from '#lib/route-queries';
import { generalContent } from '#store';
import type { HomeContributionData, RouteQueries, RouteQuery } from '#type';
import { client, fetchMyResponses } from '#utils/api';

/** The open CrowdNewsrooms, newest first */
const openCalloutsQuery = queryOptions({
  queryKey: ['callouts', 'open'],
  queryFn: () =>
    client.callout.list(
      {
        sort: 'starts',
        order: 'DESC',
        rules: {
          condition: 'AND',
          rules: [
            { field: 'status', operator: 'equal', value: [ItemStatus.Open] },
            { field: 'hidden', operator: 'equal', value: [false] },
          ],
        },
      },
      ['hasAnswered', 'responseCount']
    ),
});

const latestResponsesQuery = queryOptions({
  queryKey: ['callouts', 'responses', 'me', 'latest'],
  queryFn: () => fetchMyResponses(3),
});

/** The newsletter groups the member can join or leave */
const newsletterGroupsQuery = queryOptions({
  queryKey: ['contact', 'me', 'newsletter-groups'],
  queryFn: () => client.contact.newsletter.getGroups('me'),
});

const fetchLastPayment = async () => {
  const payments = await client.contact.payment.list('me', {
    sort: 'chargeDate',
    order: 'DESC',
    limit: 1,
    rules: {
      condition: 'AND',
      rules: [
        {
          field: 'status',
          operator: 'equal',
          value: [PaymentStatus.Successful],
        },
      ],
    },
  });
  return payments.items[0] ?? null;
};

/**
 * The member's contribution, and for the states that show it their most
 * recent successful payment. If the payment fails to load, it's left out.
 */
const loadContribution = async (): Promise<HomeContributionData> => {
  const info = await client.contact.contribution.get();

  const hasCurrentContribution =
    info.membershipStatus === MembershipStatus.Expiring ||
    (info.membershipStatus === MembershipStatus.Active &&
      info.type !== ContributionType.None);
  const lastPayment = hasCurrentContribution
    ? null
    : await fetchLastPayment().catch(() => null);

  return { info, lastPayment };
};

const contributionQuery = queryOptions({
  queryKey: ['contact', 'me', 'contribution'],
  queryFn: loadContribution,
});

/**
 * The queries the home page reads, one per card, so a slow card doesn't hold
 * up the rest.
 */
const homeQueries = {
  openCallouts: openCalloutsQuery,
  latestResponses: latestResponsesQuery,
  newsletterGroups: newsletterGroupsQuery,
  contribution: contributionQuery,
};

/** Starts the queries in `homeQueries`. Leaving one out is a type error. */
export const routeQueries: RouteQueries = () => {
  const starts: Record<keyof typeof homeQueries, RouteQuery | undefined> = {
    openCallouts: routeQuery(homeQueries.openCallouts),
    latestResponses: routeQuery(homeQueries.latestResponses),
    newsletterGroups: routeQuery(homeQueries.newsletterGroups),
    contribution: generalContent.value.hideContribution
      ? undefined
      : routeQuery(homeQueries.contribution),
  };
  return Object.values(starts).filter((start) => start !== undefined);
};
</script>

<script lang="ts" setup>
import type { ContentProfileData, GetContactData } from '@beabee/beabee-common';
import { type Ref, computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import HomeCalloutsCard from '#components/pages/profile/HomeCalloutsCard.vue';
import HomeContributionCard from '#components/pages/profile/HomeContributionCard.vue';
import HomeNewslettersCard from '#components/pages/profile/HomeNewslettersCard.vue';
import HomeResponsesCard from '#components/pages/profile/HomeResponsesCard.vue';
import NoticeContainer from '#components/pages/profile/NoticeContainer.vue';
import WelcomeCard from '#components/welcome/WelcomeCard.vue';
import { useLazyQuery } from '#composables/useLazyQuery';
import { currentUser } from '#store';
import { addBreadcrumb } from '#store/breadcrumb';
import { routeIcons, routeLabels } from '#utils/route-nav';

const { t } = useI18n();

const callouts = useLazyQuery(homeQueries.openCallouts);
const responses = useLazyQuery(homeQueries.latestResponses);
const newsletters = useLazyQuery(homeQueries.newsletterGroups);
const contribution = useLazyQuery(() => ({
  ...homeQueries.contribution,
  enabled: !generalContent.value.hideContribution,
}));

addBreadcrumb(
  computed(() => [
    { label: t(routeLabels.profile), to: '/profile', icon: routeIcons.profile },
  ])
);

const greetingKey = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'homePage.greeting.morning';
  if (hour < 18) return 'homePage.greeting.afternoon';
  return 'homePage.greeting.evening';
});

const hasWelcomeMessageQuery = useRoute().query.welcomeMessage === 'true';

const showWelcomeMessage = ref(hasWelcomeMessageQuery);

const removeWelcomeMessage = () => {
  showWelcomeMessage.value = false;
};

const profileContent = ref<ContentProfileData>({
  introMessage: '',
});

// This page is behind auth so currentUser can't be null
// TODO: is there a nicer way to handle this?
const user = currentUser as Ref<GetContactData>;

onBeforeMount(async () => {
  profileContent.value = await client.content.get('profile');
});
</script>
