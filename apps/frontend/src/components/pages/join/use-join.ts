import {
  type ContentPaymentData,
  ContributionPeriod,
  PaymentMethod,
  type PaymentPeriod,
  calcPaymentFee,
} from '@beabee/beabee-common';

import { i18n } from '@lib/i18n';
import { type Ref, computed, reactive } from 'vue';

const { n, t } = i18n.global;

const signUpData = reactive({
  email: '',
  amount: 5,
  period: ContributionPeriod.Monthly as PaymentPeriod,
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
          : signUpData.period === ContributionPeriod.Annually
            ? t('common.perYearText')
            : t('common.perOneTimeText')),
    };
  });

  return { signUpDescription, signUpData };
}
