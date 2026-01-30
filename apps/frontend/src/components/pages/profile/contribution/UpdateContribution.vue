<template>
  <div>
    <AppHeading>{{ buttonText }}</AppHeading>

    <p v-if="isManualActiveMember" class="mb-3">
      {{
        t('contribution.manualPayment', {
          source:
            (contribution.paymentSource?.method === null &&
              contribution.paymentSource.source) ||
            t('contribution.manualPaymentSource'),
        })
      }}
    </p>

    <AppNotification
      v-if="contribution.nextAmount && contribution.renewalDate"
      variant="info"
      :title="
        t('contribution.nextAmountChanging', {
          nextAmount: n(contribution.nextAmount, 'currency'),
          renewalDate: formatLocale(
            contribution.renewalDate || new Date(),
            'PPP'
          ),
        })
      "
      :icon="faInfoCircle"
      class="mb-4"
    />

    <PaymentFlowForm
      id="profile-update-contribution"
      :title="t(`paymentMethods.${newContribution.paymentMethod}.setLabel`)"
      :button-text="buttonText"
      :stripe-public-key="paymentContent.stripePublicKey"
      :flow-data="paymentData"
      :start-flow="handleStartFlow"
      :complete-flow="handleCompleteFlow"
    >
      <AppContribution
        v-model:amount="newContribution.amount"
        v-model:pay-fee="newContribution.payFee"
        v-model:period="newContribution.period"
        v-model:payment-method="newContribution.paymentMethod"
        :content="content"
        :payment-content="paymentContent"
        :show-period="showChangePeriod"
        :show-payment-method="!isAutoActiveMember"
        mode="contribution"
      />

      <ProrateContribution
        v-model="newContribution.prorate"
        :new-amount="newContribution.amount"
        :old-amount="contribution.amount || 0"
        :renewal-date="contribution.renewalDate || new Date()"
      />
    </PaymentFlowForm>

    <p v-if="paymentContent.taxRate !== null" class="mt-2 text-center text-sm">
      {{ t('join.tax.included', { taxRate: paymentContent.taxRate }) }}
    </p>
  </div>
</template>
<script lang="ts" setup>
import {
  type ContentPaymentData,
  type ContributionInfo,
  ContributionPeriod,
  ContributionType,
  MembershipStatus,
  PaymentMethod,
} from '@beabee/beabee-common';
import { AppHeading, AppNotification, formatLocale } from '@beabee/vue';
import { addNotification } from '@beabee/vue/store/notifications';

import AppContribution from '@components/contribution/AppContribution.vue';
import PaymentFlowForm from '@components/forms/PaymentFlowForm.vue';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { currentUser } from '@store/currentUser';
import { client } from '@utils/api';
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ContributionContent } from '../../../../type/contribution';
import ProrateContribution from './ProrateContribution.vue';

const { t, n } = useI18n();

const props = defineProps<{
  content: ContributionContent;
  paymentContent: ContentPaymentData;
}>();

const contribution = defineModel<ContributionInfo>({ required: true });

const newContribution = reactive({
  amount: 5,
  period: ContributionPeriod.Monthly,
  payFee: true,
  prorate: true,
  paymentMethod: PaymentMethod.StripeCard,
});

const paymentData = computed(() => ({
  email: currentUser.value ? currentUser.value.email : '',
  amount: newContribution.amount,
  period: newContribution.period,
}));

const isActiveMember = computed(
  () => contribution.value.membershipStatus === MembershipStatus.Active
);
const isExpiringMember = computed(
  () => contribution.value.membershipStatus === MembershipStatus.Expiring
);

const isManualActiveMember = computed(
  () =>
    isActiveMember.value && contribution.value.type === ContributionType.Manual
);
const isAutoActiveMember = computed(
  () =>
    isActiveMember.value &&
    contribution.value.type === ContributionType.Automatic
);

// Only non-active members and monthly manual contributors can change their period
// as otherwise proration gets complicated
const showChangePeriod = computed(
  () =>
    !isActiveMember.value ||
    (isManualActiveMember.value &&
      contribution.value.period !== ContributionPeriod.Annually)
);

const buttonText = computed(() =>
  isManualActiveMember.value
    ? t('contribution.updatePaymentType')
    : isActiveMember.value
      ? t('contribution.updateContribution')
      : isExpiringMember.value
        ? t('contribution.restartContribution')
        : t('contribution.startContribution')
);

async function handleStartFlow(completeUrl: string) {
  if (isAutoActiveMember.value) {
    contribution.value = await client.contact.contribution.update({
      amount: newContribution.amount,
      period: newContribution.period,
      payFee: newContribution.payFee,
      prorate: newContribution.prorate,
    });

    addNotification({
      variant: 'success',
      title: t('contribution.updatedContribution'),
    });
    return {};
  } else {
    return await client.contact.contribution.start({
      amount: newContribution.amount,
      period: newContribution.period,
      payFee:
        newContribution.payFee &&
        newContribution.period === ContributionPeriod.Monthly,
      prorate:
        newContribution.prorate &&
        newContribution.period === ContributionPeriod.Annually,
      paymentMethod: newContribution.paymentMethod,
      completeUrl,
    });
  }
}

async function handleCompleteFlow(paymentFlowId: string) {
  contribution.value =
    await client.contact.contribution.completeStart(paymentFlowId);

  addNotification({
    variant: 'success',
    title: t('contribution.startedContribution'),
  });
}

watch(
  props,
  () => {
    newContribution.amount =
      contribution.value.amount || props.content.initialAmount;
    newContribution.period =
      contribution.value.period ||
      (props.content.initialPeriod as ContributionPeriod); // TODO
    newContribution.payFee = props.content.showAbsorbFee
      ? contribution.value.payFee === undefined
        ? true
        : contribution.value.payFee
      : false;
    newContribution.prorate = true;
    newContribution.paymentMethod =
      contribution.value.paymentSource?.method ||
      props.content.paymentMethods[0];
  },
  { immediate: true }
);
</script>
