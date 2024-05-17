<template>
  <div
    v-if="
      contribution.type !== ContributionType.None &&
      contribution.membershipStatus !== MembershipStatus.None
    "
    class="flex flex-col bg-white p-8 shadow"
  >
    <template v-if="contribution.membershipStatus === MembershipStatus.Expired">
      <AppSubHeading>{{ t('contribution.expired') }}</AppSubHeading>

      <p>
        {{ t('contribution.expiredText') }}
      </p>
    </template>

    <div v-else class="text-center">
      <p>{{ t('contribution.contributing') }}</p>
      <div class="my-2 font-bold">
        <div class="text-3.5xl leading-7">
          {{ n(contribution.amount!, 'currency') }}
        </div>
        {{ perPeriod }}
      </div>

      <div v-if="contribution.membershipStatus === MembershipStatus.Expiring">
        <i18n-t keypath="contribution.willExpire">
          <template #expires>
            <AppTime
              v-if="contribution.membershipExpiryDate"
              :datetime="contribution.membershipExpiryDate"
              time-only
              class="font-bold text-danger"
            />
          </template>
        </i18n-t>
      </div>
      <div
        v-else-if="contribution.membershipStatus === MembershipStatus.Active"
      >
        <p>{{ t('common.thankYou') }}</p>
        <div class="mt-2 text-sm text-body-80">
          <i18n-t
            v-if="contribution.hasPendingPayment"
            keypath="contribution.hasPendingPayment"
          />
          <i18n-t
            v-else-if="contribution.renewalDate"
            :keypath="
              contribution.type === ContributionType.Automatic
                ? 'contribution.willRenew'
                : 'contribution.dueToRenew'
            "
          >
            <template #renewalDate>
              <b>{{ formatLocale(contribution.renewalDate, 'PPP') }}</b>
            </template>
          </i18n-t>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ContributionPeriod,
  ContributionType,
  MembershipStatus,
} from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';
import { formatLocale } from '@utils/dates';
import { computed } from 'vue';

import AppSubHeading from '@components/AppSubHeading.vue';
import AppTime from '@components/AppTime.vue';

import type { ContributionInfo } from '@type';

const { n, t } = useI18n();

const props = defineProps<{
  contribution: ContributionInfo;
}>();

const perPeriod = computed(() =>
  props.contribution.period === ContributionPeriod.Monthly
    ? t('common.perMonthText')
    : t('common.perYearText')
);
</script>
