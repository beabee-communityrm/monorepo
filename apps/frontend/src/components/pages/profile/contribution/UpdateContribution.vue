<template>
  <div>
    <AppHeading>{{ buttonText }}</AppHeading>

    <p v-if="isManualActiveMember" class="mb-3">
      {{
        t('contribution.manualPayment', {
          source:
            (contribution.paymentSource?.method === PaymentMethod.Manual &&
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
          nextAmount: n(contribution.nextAmount || 5, 'currency'),
          renewalDate: formatLocale(
            contribution.renewalDate || new Date(),
            'PPP'
          ),
        })
      "
      :icon="faInfoCircle"
      class="mb-4"
    />

    <AppForm
      :button-text="buttonText"
      full-button
      :success-text="t('contribution.updatedContribution')"
      @submit="handleSubmit"
    >
      <ContributionAmount
        v-model:amount="newContribution.amount"
        v-model:period="newContribution.period"
        :min-monthly-amount="content.minMonthlyAmount"
        :preset-amounts="content.presetAmounts[newContribution.period]"
        :show-period="showChangePeriod"
        class="mb-4"
      />

      <ContributionMethod
        v-model:payment-method="newContribution.paymentMethod"
        v-model:pay-fee="newContribution.payFee"
        :content="content"
        :data="newContribution"
        :methods="content.paymentMethods"
        :show-payment-method="!isAutoActiveMember"
        class="mb-4"
      />

      <ProrateContribution
        v-model="newContribution.prorate"
        :new-amount="newContribution.amount"
        :old-amount="contribution.amount || 0"
        :renewal-date="contribution.renewalDate || new Date()"
      />
    </AppForm>

    <p
      v-if="paymentContent.taxRateEnabled"
      class="-mt-2 mb-4 text-center text-sm"
    >
      {{ t('join.tax.included', { taxRate: paymentContent.taxRate }) }}
    </p>

    <AppModal
      v-if="stripeClientSecret"
      :open="stripePaymentLoaded"
      class="w-full"
      @close="reset"
    >
      <AppHeading>
        {{ t(`paymentMethods.${newContribution.paymentMethod}.setLabel`) }}
      </AppHeading>
      <StripePayment
        :client-secret="stripeClientSecret"
        :public-key="paymentContent.stripePublicKey"
        :email="email"
        :return-url="startContributionCompleteUrl"
        @loaded="onStripeLoaded"
      />
    </AppModal>
  </div>
</template>
<script lang="ts" setup>
import {
  ContributionPeriod,
  PaymentMethod,
  MembershipStatus,
  ContributionType,
  type ContentPaymentData,
  type ContentJoinData,
  type ContributionInfo,
} from '@beabee/beabee-common';
import { computed, onBeforeMount, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import ProrateContribution from './ProrateContribution.vue';
import AppModal from '@components/AppModal.vue';
import StripePayment from '@components/StripePayment.vue';
import AppHeading from '@components/AppHeading.vue';
import AppNotification from '@components/AppNotification.vue';

import {
  startContribution,
  startContributionCompleteUrl,
  updateContribution,
} from '@utils/api/contact';

import { currentUser } from '@store/currentUser';
import { formatLocale } from '@utils/dates';

import AppForm from '@components/forms/AppForm.vue';
import ContributionAmount from '@components/contribution/ContributionAmount.vue';
import ContributionMethod from '@components/contribution/ContributionMethod.vue';

const { t, n } = useI18n();

const props = defineProps<{
  content: ContentJoinData;
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

const stripeClientSecret = ref('');
const stripePaymentLoaded = ref(false);

const email = computed(() =>
  currentUser.value ? currentUser.value.email : ''
);

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

async function handleSubmit() {
  if (isAutoActiveMember.value) {
    contribution.value = await updateContribution(newContribution);
  } else {
    const data = await startContribution(newContribution);
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    } else if (data.clientSecret) {
      stripeClientSecret.value = data.clientSecret;
    }
    return false;
  }
}

function onStripeLoaded() {
  stripePaymentLoaded.value = true;
}

function reset() {
  stripeClientSecret.value = '';
  stripePaymentLoaded.value = false;
}

watch(
  props,
  () => {
    newContribution.amount =
      contribution.value.amount || props.content.initialAmount;
    newContribution.period =
      contribution.value.period || props.content.initialPeriod;
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

onBeforeMount(reset);
</script>
