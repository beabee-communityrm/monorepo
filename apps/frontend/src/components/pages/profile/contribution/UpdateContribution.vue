<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <AppHeading>{{ buttonText }}</AppHeading>

      <p v-if="isManualActiveMember" class="mb-3">
        {{
          t('contribution.manualPayment', {
            source:
              (modelValue.paymentSource?.method === null &&
                modelValue.paymentSource.source) ||
              t('contribution.manualPaymentSource'),
          })
        }}
      </p>

      <AppNotification
        v-if="modelValue.nextAmount && modelValue.renewalDate"
        variant="info"
        :title="
          t('contribution.nextAmountChanging', {
            nextAmount: n(modelValue.nextAmount || 5, 'currency'),
            renewalDate: formatLocale(
              modelValue.renewalDate || new Date(),
              'PPP'
            ),
          })
        "
        :icon="faInfoCircle"
        class="mb-4"
      />

      <AppContribution
        v-model:amount="newContribution.amount"
        v-model:pay-fee="newContribution.payFee"
        v-model:period="newContribution.period"
        v-model:payment-method="newContribution.paymentMethod"
        :content="content"
        :payment-content="paymentContent"
        :show-period="showChangePeriod"
        :show-payment-method="!isAutoActiveMember"
        :disable-one-time-donation-tab="true"
      />

      <ProrateContribution
        v-model="newContribution.prorate"
        :new-amount="newContribution.amount"
        :old-amount="modelValue.amount || 0"
        :renewal-date="modelValue.renewalDate || new Date()"
      />

      <AppNotification
        v-if="cantUpdate"
        class="mb-4"
        variant="error"
        :title="t('contribution.contributionUpdateError')"
      />

      <AppButton
        :disabled="!canSubmit || validation.$invalid"
        type="submit"
        variant="link"
        class="mb-4 w-full"
        :loading="loading"
      >
        {{ buttonText }}
      </AppButton>

      <p
        v-if="paymentContent.taxRateEnabled"
        class="-mt-2 mb-4 text-center text-sm"
      >
        {{ t('join.tax.included', { taxRate: paymentContent.taxRate }) }}
      </p>
    </form>

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
        :payment-data="paymentData"
        :return-url="client.contact.contribution.completeUrl"
        @loaded="onStripeLoaded"
      />
    </AppModal>
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
  type PaymentPeriod,
  type StartContributionData,
} from '@beabee/beabee-common';
import {
  AppButton,
  AppHeading,
  AppModal,
  AppNotification,
  formatLocale,
} from '@beabee/vue';
import { addNotification } from '@beabee/vue/store/notifications';

import StripePayment from '@components/StripePayment.vue';
import AppContribution from '@components/contribution/AppContribution.vue';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { currentUser } from '@store/currentUser';
import { client, isApiError } from '@utils/api';
import useVuelidate from '@vuelidate/core';
import { computed, onBeforeMount, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ContributionContent } from '../../../../type/contribution';
import ProrateContribution from './ProrateContribution.vue';

const validation = useVuelidate();

const { t, n } = useI18n();

const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  modelValue: ContributionInfo;
  content: ContributionContent;
  paymentContent: ContentPaymentData;
}>();

const newContribution = reactive({
  amount: 5,
  period: ContributionPeriod.Monthly as PaymentPeriod,
  payFee: true,
  prorate: true,
  paymentMethod: PaymentMethod.StripeCard,
});

const cantUpdate = ref(false);
const loading = ref(false);
const stripeClientSecret = ref('');
const stripePaymentLoaded = ref(false);

const paymentData = computed(() => ({
  email: currentUser.value ? currentUser.value.email : '',
  amount: newContribution.amount,
  period: newContribution.period,
}));

const isActiveMember = computed(
  () => props.modelValue.membershipStatus === MembershipStatus.Active
);
const isExpiringMember = computed(
  () => props.modelValue.membershipStatus === MembershipStatus.Expiring
);

const isManualActiveMember = computed(
  () =>
    isActiveMember.value && props.modelValue.type === ContributionType.Manual
);
const isAutoActiveMember = computed(
  () =>
    isActiveMember.value && props.modelValue.type === ContributionType.Automatic
);

// Only non-active members and monthly manual contributors can change their period
// as otherwise proration gets complicated
const showChangePeriod = computed(
  () =>
    !isActiveMember.value ||
    (isManualActiveMember.value &&
      props.modelValue.period !== ContributionPeriod.Annually)
);

const canSubmit = computed(
  () =>
    !isAutoActiveMember.value ||
    props.modelValue.amount != newContribution.amount ||
    props.modelValue.payFee != newContribution.payFee
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

async function handleCreate() {
  if (newContribution.period === 'one-time') {
    // TODO: handle separately
    return;
  }

  const clientData: StartContributionData = {
    amount: newContribution.amount,
    period: newContribution.period,
    payFee:
      newContribution.payFee &&
      newContribution.period === ContributionPeriod.Monthly,
    prorate:
      newContribution.prorate &&
      newContribution.period === ContributionPeriod.Annually,
    paymentMethod: newContribution.paymentMethod,
    completeUrl: client.contact.contribution.completeUrl,
  };
  const data = await client.contact.contribution.start(clientData);
  if (data.redirectUrl) {
    window.location.href = data.redirectUrl;
  } else if (data.clientSecret) {
    stripeClientSecret.value = data.clientSecret;
  }
}

async function handleUpdate() {
  // Can't update a one-time contribution
  if (newContribution.period === 'one-time') {
    return;
  }

  try {
    const data = await client.contact.contribution.update({
      amount: newContribution.amount,
      period: newContribution.period,
      payFee: newContribution.payFee,
      prorate: newContribution.prorate,
    });
    emit('update:modelValue', data);

    addNotification({
      variant: 'success',
      title: t('contribution.updatedContribution'),
    });
  } catch (err) {
    if (isApiError(err, ['cant-update-contribution'])) {
      cantUpdate.value = true;
    } else {
      throw err;
    }
  }
}

async function handleSubmit() {
  loading.value = true;

  try {
    await (isAutoActiveMember.value ? handleUpdate() : handleCreate());
  } finally {
    loading.value = false;
  }
}

function onStripeLoaded() {
  stripePaymentLoaded.value = true;
  loading.value = false;
}

function reset() {
  cantUpdate.value = false;
  loading.value = false;
  stripeClientSecret.value = '';
  stripePaymentLoaded.value = false;
}

watch(
  props,
  () => {
    newContribution.amount =
      props.modelValue.amount || props.content.initialAmount;
    newContribution.period =
      props.modelValue.period || props.content.initialPeriod;
    newContribution.payFee = props.content.showAbsorbFee
      ? props.modelValue.payFee === undefined
        ? true
        : props.modelValue.payFee
      : false;
    newContribution.prorate = true;
    newContribution.paymentMethod =
      props.modelValue.paymentSource?.method || props.content.paymentMethods[0];
  },
  { immediate: true }
);

onBeforeMount(reset);
</script>
