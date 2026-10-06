<!--
  # HomeContributionCard
  The member's contribution on the home page, in one of five states: active,
  cancelling (cancelled but still paid up), cancelled, one-off donations only,
  or never contributed.

  For the states that show it, also loads the member's most recent successful
  payment. If that fails, the card shows what it can without it.
-->
<template>
  <UCard>
    <template #header>
      <AppCardHeader
        :icon="routeIcons.profileContribution"
        :title="t('homePage.contribution.title')"
        :level="3"
      >
        <template v-if="view" #aside>
          <UBadge :color="view.badgeColor" variant="subtle" class="shrink-0">
            <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
            {{ t(`homePage.contribution.status.${view.state}`) }}
          </UBadge>
        </template>
      </AppCardHeader>
    </template>

    <HomeLoadError v-if="error" />

    <div v-else-if="!view" class="space-y-3">
      <USkeleton class="h-8 w-1/3" />
      <USkeleton class="h-4 w-2/3" />
      <USkeleton class="h-4 w-1/2" />
    </div>

    <div v-else class="flex flex-col gap-5">
      <div class="flex flex-col gap-3">
        <p v-if="view.amount" class="flex items-baseline gap-2">
          <span class="text-3xl font-semibold text-highlighted">
            {{ view.amount }}
          </span>
          <span class="text-muted">{{ view.period }}</span>
        </p>
        <p
          v-else-if="view.state !== 'active' && view.state !== 'cancelling'"
          class="text-base font-semibold text-highlighted"
        >
          {{ t(`homePage.contribution.headline.${view.state}`) }}
        </p>

        <dl v-if="view.rows.length" class="flex flex-col gap-2">
          <div
            v-for="row in view.rows"
            :key="row.label"
            class="flex items-baseline justify-between gap-3"
          >
            <dt class="text-muted">{{ row.label }}</dt>
            <dd class="text-right font-medium text-highlighted">
              {{ row.value }}
            </dd>
          </div>
        </dl>
      </div>

      <p
        v-if="view.state !== 'active' && view.state !== 'cancelled'"
        class="rounded-md bg-muted px-3 py-2.5 text-toned"
      >
        {{ t(`homePage.contribution.note.${view.state}`) }}
      </p>

      <UButton
        v-if="view.state === 'active'"
        to="/profile/contribution"
        color="neutral"
        variant="outline"
        block
        class="min-h-11"
      >
        {{ t('homePage.manageContribution') }}
      </UButton>
      <UButton v-else to="/profile/contribution" block class="min-h-11">
        {{ t(actionKeys[view.state]) }}
      </UButton>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import {
  type ContributionInfo,
  ContributionPeriod,
  ContributionType,
  type GetPaymentData,
  MembershipStatus,
  type PaymentSource,
  PaymentStatus,
} from '@beabee/beabee-common';
import { AppCardHeader, formatLocale } from '@beabee/vue';

import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import HomeLoadError from '#components/pages/profile/HomeLoadError.vue';
import { client } from '#utils/api';
import { routeIcons } from '#utils/route-nav';

const { t, n } = useI18n();

const contribution = ref<ContributionInfo>();
const lastPayment = ref<GetPaymentData | null>();
const error = ref(false);

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

onBeforeMount(async () => {
  let info: ContributionInfo;
  try {
    info = await client.contact.contribution.get();
  } catch {
    error.value = true;
    return;
  }

  const hasCurrentContribution =
    info.membershipStatus === MembershipStatus.Expiring ||
    (info.membershipStatus === MembershipStatus.Active &&
      info.type !== ContributionType.None);
  if (!hasCurrentContribution) {
    lastPayment.value = await fetchLastPayment().catch(() => null);
  }

  contribution.value = info;
});

const formatDate = (date: Date) => formatLocale(date, 'd MMM yyyy');

const actionKeys = {
  cancelling: 'homePage.contribution.action.cancelling',
  cancelled: 'contribution.restartContribution',
  oneOff: 'homePage.contribution.action.oneOff',
  none: 'contribution.startContribution',
} as const;

const paidBy = (source: PaymentSource) => {
  if (!source.method) return undefined;
  const method = t(`paymentMethods.${source.method}.label`);
  const digits =
    'last4' in source
      ? source.last4
      : 'accountNumberEnding' in source
        ? source.accountNumberEnding
        : undefined;
  return digits
    ? t('homePage.contribution.paymentEnding', { method, digits })
    : method;
};

const view = computed(() => {
  const c = contribution.value;
  if (!c) return undefined;

  const amount = c.amount ? n(c.amount, 'currency') : undefined;
  const period =
    c.period === ContributionPeriod.Annually
      ? t('contribution.perYearText')
      : t('contribution.perMonthText');
  const last = lastPayment.value;

  if (c.membershipStatus === MembershipStatus.Expiring) {
    return {
      state: 'cancelling',
      badgeColor: 'warning',
      amount,
      period,
      rows: c.membershipExpiryDate
        ? [
            {
              label: t('homePage.contribution.endsOn'),
              value: formatDate(c.membershipExpiryDate),
            },
          ]
        : [],
    } as const;
  }

  if (
    c.membershipStatus === MembershipStatus.Expired &&
    c.type !== ContributionType.None
  ) {
    return {
      state: 'cancelled',
      badgeColor: 'neutral',
      amount: undefined,
      period: undefined,
      rows: last
        ? [
            {
              label: t('homePage.contribution.lastPayment'),
              value: formatDate(last.chargeDate),
            },
          ]
        : [],
    } as const;
  }

  if (
    c.type !== ContributionType.None &&
    c.membershipStatus === MembershipStatus.Active
  ) {
    const method = c.paymentSource && paidBy(c.paymentSource);
    return {
      state: 'active',
      badgeColor: 'success',
      amount,
      period,
      rows: [
        ...(c.renewalDate
          ? [
              {
                label: t('homePage.contribution.nextPayment'),
                value: formatDate(c.renewalDate),
              },
            ]
          : []),
        ...(method
          ? [{ label: t('contribution.paymentMethod'), value: method }]
          : []),
      ],
    } as const;
  }

  if (last) {
    return {
      state: 'oneOff',
      badgeColor: 'neutral',
      amount: undefined,
      period: undefined,
      rows: [
        {
          label: t('homePage.contribution.lastContribution'),
          value: t('homePage.contribution.amountOnDate', {
            amount: n(last.amount, 'currency'),
            date: formatDate(last.chargeDate),
          }),
        },
      ],
    } as const;
  }

  return {
    state: 'none',
    badgeColor: 'neutral',
    amount: undefined,
    period: undefined,
    rows: [],
  } as const;
});
</script>
