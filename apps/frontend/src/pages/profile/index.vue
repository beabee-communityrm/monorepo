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
        <HomeCalloutsCard />
        <HomeResponsesCard />
      </div>

      <div class="flex w-full flex-col gap-5 md:w-80 md:shrink-0">
        <HomeContributionCard v-if="!generalContent.hideContribution" />
        <HomeNewslettersCard />
      </div>
    </div>
  </div>
</template>

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
import { currentUser, generalContent } from '#store';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { routeIcons, routeLabels } from '#utils/route-nav';

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

// This page is behind auth so currentUser can't be null
// TODO: is there a nicer way to handle this?
const user = currentUser as Ref<GetContactData>;

onBeforeMount(async () => {
  profileContent.value = await client.content.get('profile');
});
</script>
