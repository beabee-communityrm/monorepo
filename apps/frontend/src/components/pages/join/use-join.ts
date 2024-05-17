import {
  calcPaymentFee,
  ContributionPeriod,
  PaymentMethod,
} from '@beabee/beabee-common';
import { reactive, computed, type Ref } from 'vue';

import i18n from '@lib/i18n';

import type { ContentPaymentData } from '@type';

const { n, t } = i18n.global;

const signUpData = reactive({
  email: '',
  password: '',
  amount: 5,
  period: ContributionPeriod.Monthly,
  payFee: true,
  noContribution: false,
  prorate: false,
  paymentMethod: PaymentMethod.StripeCard,
});

export function useJoin(content: Ref<ContentPaymentData>) {
  const signUpDescription = computed(() => {
    const totalAmount =
      signUpData.amount +
      (signUpData.payFee
        ? calcPaymentFee(signUpData, content.value.stripeCountry)
        : 0);

    return {
      contribution:
        n(totalAmount, 'currency') +
        ' ' +
        (signUpData.period === ContributionPeriod.Monthly
          ? t('common.perMonthText')
          : t('common.perYearText')),
    };
  });

  return { signUpDescription, signUpData };
}
