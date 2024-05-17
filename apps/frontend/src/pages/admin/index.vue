<route lang="yaml">
name: admin
meta:
  role: admin
  pageTitle: menu.dashboard
</route>

<template>
  <PageTitle :title="t('menu.dashboard')" border />
  <p class="mb-8">
    {{ t('adminDashboard.welcomeBack', { firstName: currentUser?.firstname }) }}
  </p>
  <div class="grid grid-cols-12 gap-6">
    <div v-if="!env.cnrMode" class="col-span-12 md:col-span-5 xl:col-span-5">
      <AppHeading>{{ t('adminDashboard.numbers.title') }}</AppHeading>
      <div v-if="stats" class="mb-6 flex gap-4">
        <KeyStat
          :label="t('adminDashboard.numbers.revenue')"
          :stat="
            stats.totalRevenue === null
              ? '-'
              : n(stats.totalRevenue, 'currency')
          "
        />
        <KeyStat
          :label="t('adminDashboard.numbers.averageContribution')"
          :stat="
            stats.averageContribution === null
              ? '-'
              : n(stats.averageContribution, 'currency')
          "
        />
        <KeyStat
          :label="t('adminDashboard.numbers.newMembers')"
          :stat="'+' + n(stats.newContacts)"
        />
      </div>
      <AppHeading>{{ t('adminDashboard.mostRecentMembers.title') }}</AppHeading>
      <ul>
        <li
          v-for="member in recentMembers"
          :key="member.id"
          class="mb-3 flex gap-4"
        >
          <router-link :to="'/admin/contacts/' + member.id" class="text-link">
            {{ member.displayName }}
          </router-link>
          <AppTime
            class="flex-1 text-right text-sm font-semibold text-body-60"
            :datetime="member.joined"
          />
        </li>
      </ul>
    </div>
    <div class="col-span-12 md:col-span-7 xl:col-span-7">
      <AppHeading>{{ t('adminDashboard.latestCallout.title') }}</AppHeading>
      <div class="relative mb-8 block rounded bg-white p-4">
        <div v-if="latestCallout">
          <CalloutSummary :callout="latestCallout" />
          <router-link
            class="absolute inset-0"
            :to="'/admin/callouts/view/' + latestCallout.slug"
          />
        </div>
        <div v-else-if="latestCallout === null">
          {{ t('adminDashboard.latestCallout.empty') }}
          <router-link to="/admin/callouts/new" class="text-link">
            {{ t('adminDashboard.latestCallout.createNew') }}
          </router-link>
        </div>
      </div>
      <a
        href="https://join.slack.com/t/beabee-communityrm/shared_invite/zt-1ezksg2wz-uLgLv4FxmCepzBlvLzL6tQ"
        class="block rounded bg-white bg-[url('/src/assets/images/slack-bg.png')] bg-auto bg-right-top p-10 text-center text-2xl font-light text-link md:bg-cover"
      >
        <p class="max-w-72 m-auto w-72">
          {{ t('adminDashboard.joinSlack') }}
        </p>
      </a>
    </div>
  </div>
  <div class="mt-8 gap-6 lg:flex">
    <HintBox class="content-i18n" :hint="t('adminDashboard.hint1')" />
    <HintBox class="content-i18n" :hint="t('adminDashboard.hint2')" />
    <HintBox class="content-i18n" :hint="t('adminDashboard.hint3')" />
  </div>
  <div
    class="content-i18n mt-8 text-center text-sm"
    v-html="t('adminDashboard.supportInbox')"
  />
</template>
<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';
import PageTitle from '@components/PageTitle.vue';
import { currentUser } from '@store';
import AppHeading from '@components/AppHeading.vue';
import KeyStat from '@components/pages/admin/KeyStat.vue';
import { computed, onBeforeMount, ref } from 'vue';

import { fetchContacts } from '@utils/api/contact';
import HintBox from '@components/pages/admin/HintBox.vue';
import { fetchCallouts } from '@utils/api/callout';
import CalloutSummary from '@components/callout/CalloutSummary.vue';
import { fetchStats } from '@utils/api/stats';
import { subDays } from 'date-fns';
import { addBreadcrumb } from '@store/breadcrumb';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import env from '../../env';
import AppTime from '@components/AppTime.vue';

import type { GetCalloutDataWith, GetContactData, GetStatsData } from '@type';

const { n, t } = useI18n();

addBreadcrumb(
  computed(() => [
    {
      title: t('menu.dashboard'),
      to: '/admin',
      icon: faChartLine,
    },
  ])
);

const stats = ref<GetStatsData>();
const recentMembers = ref<GetContactData[]>([]);
const latestCallout = ref<GetCalloutDataWith<'responseCount'> | null>();

onBeforeMount(async () => {
  stats.value = await fetchStats({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  recentMembers.value = (
    await fetchContacts({
      limit: 5,
      sort: 'joined',
      order: 'DESC',
      rules: {
        condition: 'AND',
        rules: [
          { field: 'activeMembership', operator: 'equal', value: [true] },
        ],
      },
    })
  ).items;

  const callouts = await fetchCallouts(
    {
      limit: 1,
      sort: 'starts',
      order: 'DESC',
      rules: {
        condition: 'AND',
        rules: [
          {
            field: 'status',
            operator: 'equal',
            value: [ItemStatus.Open],
          },
        ],
      },
    },
    ['responseCount']
  );
  latestCallout.value = callouts.count > 0 ? callouts.items[0] : null;
});
</script>
