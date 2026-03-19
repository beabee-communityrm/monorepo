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
        {{
          contribution.period === ContributionPeriod.Monthly
            ? t('contribution.perMonthText')
            : t('contribution.perYearText')
        }}
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
  type ContributionInfo,
  ContributionPeriod,
  ContributionType,
  MembershipStatus,
} from '@beabee/beabee-common';
import { AppSubHeading, AppTime, formatLocale } from '@beabee/vue';

import { useI18n } from 'vue-i18n';

const { n, t } = useI18n();

defineProps<{ contribution: ContributionInfo }>();
</script>
