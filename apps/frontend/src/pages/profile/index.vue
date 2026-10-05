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
      :text="profileContent.introMessage"
      @close="removeWelcomeMessage"
    />

    <NoticeContainer />

    <div class="flex flex-col items-start gap-5 md:flex-row">
      <div class="flex w-full min-w-0 flex-1 flex-col gap-5">
        <HomeCalloutsCard
          :callouts="callouts?.items"
          :total="callouts?.total ?? 0"
        />
        <HomeResponsesCard
          :responses="responses?.items"
          :total="responses?.total ?? 0"
          @load-all="loadResponses(Math.min(responses?.total ?? 0, 1000))"
        />
      </div>

      <div class="flex w-full flex-col gap-5 md:w-80 md:shrink-0">
        <section>
          <SectionTitle>{{ t('homePage.yourProfile') }}</SectionTitle>

          <div class="mb-4 flex">
            <ContributionInfo :contact="user" />
          </div>

          <AppButton
            v-if="!generalContent.hideContribution"
            to="/profile/contribution"
            variant="primaryOutlined"
            >{{ t('homePage.manageContribution') }}</AppButton
          >
        </section>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  type ContentProfileData,
  type GetCalloutResponseDataWith,
  GetCalloutResponseWith,
  type GetContactData,
  ItemStatus,
  type Paginated,
} from '@beabee/beabee-common';
import { AppButton } from '@beabee/vue';

import { type Ref, computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import ContributionInfo from '#components/pages/profile/ContributionInfo.vue';
import HomeCalloutsCard from '#components/pages/profile/HomeCalloutsCard.vue';
import HomeResponsesCard from '#components/pages/profile/HomeResponsesCard.vue';
import NoticeContainer from '#components/pages/profile/NoticeContainer.vue';
import SectionTitle from '#components/pages/profile/SectionTitle.vue';
import WelcomeCard from '#components/welcome/WelcomeCard.vue';
import { currentUser, generalContent } from '#store';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { routeIcons, routeLabels } from '#utils/route-nav';
import type { CalloutCardData } from '#type';

const { t } = useI18n();

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

const callouts = ref<Paginated<CalloutCardData>>();
const responses =
  ref<Paginated<GetCalloutResponseDataWith<GetCalloutResponseWith.Callout>>>();

// This page is behind auth so currentUser can't be null
// TODO: is there a nicer way to handle this?
const user = currentUser as Ref<GetContactData>;

async function loadResponses(limit: number) {
  responses.value = await client.callout.response.list(
    {
      sort: 'createdAt',
      order: 'DESC',
      limit,
      rules: {
        condition: 'AND',
        rules: [{ field: 'contact', operator: 'equal', value: ['me'] }],
      },
    },
    [GetCalloutResponseWith.Callout]
  );
}

onBeforeMount(async () => {
  loadResponses(3);

  profileContent.value = await client.content.get('profile');

  callouts.value = await client.callout.list(
    {
      order: 'DESC',
      sort: 'starts',
      limit: 3,
      rules: {
        condition: 'AND',
        rules: [
          { field: 'status', operator: 'equal', value: [ItemStatus.Open] },
          { field: 'hidden', operator: 'equal', value: [false] },
        ],
      },
    },
    ['hasAnswered', 'responseCount']
  );
});
</script>
