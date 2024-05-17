<route lang="yaml">
name: profile
meta:
  pageTitle: homePage.title
</route>

<template>
  <PageTitle :title="`${t('common.hello')} ${user.firstname}!`" no-collapse />

  <section
    v-if="showWelcomeMessage && profileContent.introMessage"
    class="mb-10"
  >
    <WelcomeMessage
      :first-name="user.firstname"
      :last-name="user.lastname"
      :text="profileContent.introMessage"
      @close="removeWelcomeMessage"
    />
  </section>

  <NoticeContainer class="mb-10 md:mb-12" />

  <section class="mb-8 md:hidden">
    <QuickActions />
  </section>

  <section v-if="callouts.length" class="mb-6 lg:mr-6">
    <SectionTitle>{{ t('homePage.openCallouts') }}</SectionTitle>

    <div class="-mx-3 my-6 flex flex-wrap">
      <CalloutCard
        v-for="callout in callouts"
        :key="callout.slug"
        :callout="callout"
        class="mx-3 mb-5"
      />
    </div>

    <AppButton to="/callouts" variant="primaryOutlined">{{
      t('homePage.viewAllCallouts')
    }}</AppButton>
  </section>

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
</template>

<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import { ref, onBeforeMount, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import NoticeContainer from '@components/pages/profile/NoticeContainer.vue';
import ContributionInfo from '@components/pages/profile/ContributionInfo.vue';
import QuickActions from '@components/pages/profile/QuickActions.vue';
import SectionTitle from '@components/pages/profile/SectionTitle.vue';
import PageTitle from '@components/PageTitle.vue';
import AppButton from '@components/button/AppButton.vue';
import CalloutCard from '@components/callout/CalloutCard.vue';
import WelcomeMessage from '@components/welcome-message/WelcomeMessage.vue';

import { fetchContent } from '@utils/api/content';
import { fetchCallouts } from '@utils/api/callout';

import { currentUser, generalContent } from '@store';

import type { GetContactData, GetCalloutData, ContentProfileData } from '@type';

const { t } = useI18n();

const hasWelcomeMessageQuery = useRoute().query.welcomeMessage === 'true';

const showWelcomeMessage = ref(hasWelcomeMessageQuery);

const removeWelcomeMessage = () => {
  showWelcomeMessage.value = false;
};

const profileContent = ref<ContentProfileData>({
  introMessage: '',
});

const callouts = ref<GetCalloutData[]>([]);

// This page is behind auth so currentUser can't be null
// TODO: is there a nicer way to handle this?
const user = currentUser as Ref<GetContactData>;

onBeforeMount(async () => {
  profileContent.value = await fetchContent('profile');
  callouts.value = (
    await fetchCallouts({
      order: 'DESC',
      sort: 'starts',
      limit: 3,
      rules: {
        condition: 'AND',
        rules: [
          {
            field: 'status',
            operator: 'equal',
            value: [ItemStatus.Open],
          },
          {
            field: 'hidden',
            operator: 'equal',
            value: [false],
          },
        ],
      },
    })
  ).items;
});
</script>
