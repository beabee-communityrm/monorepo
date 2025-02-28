<template>
  <div>
    <AppHeading>{{ t('contribution.paymentMethod') }}</AppHeading>

    <PaymentMethod class="mb-4" :source="paymentSource" />

    <AppNotification
      v-if="cantUpdate"
      class="mb-4"
      variant="error"
      :title="t('contribution.paymentSourceUpdateError')"
    />

    <AppButton
      :loading="loading"
      variant="primaryOutlined"
      class="mb-2 w-full"
      @click="handleUpdate"
    >
      {{ changeLabel }}
    </AppButton>

    <AppModal
      v-if="stripeClientSecret"
      :open="stripePaymentLoaded"
      :title="changeLabel"
      class="w-full"
      @close="reset"
    >
      <StripePayment
        :client-secret="stripeClientSecret"
        :public-key="stripePublicKey"
        :payment-data="paymentData"
        :return-url="client.contact.contribution.completeUrl"
        @loaded="onStripeLoaded"
      />
    </AppModal>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { AppButton } from '@beabee/vue/components';
import StripePayment from '@components/StripePayment.vue';
import AppModal from '@components/AppModal.vue';
import AppHeading from '@components/AppHeading.vue';
import PaymentMethod from '@components/payment-method/PaymentMethod.vue';
import AppNotification from '@components/AppNotification.vue';

import { client, isApiError } from '@utils/api';

import type { PaymentSourceManual, PaymentSource } from '@beabee/beabee-common';
import type { StripePaymentData } from '@type/stripe-payment-data';

const { t } = useI18n();

const props = defineProps<{
  stripePublicKey: string;
  paymentSource: Exclude<PaymentSource, PaymentSourceManual>;
  paymentData: StripePaymentData;
}>();

const loading = ref(false);
const cantUpdate = ref(false);
const stripeClientSecret = ref('');
const stripePaymentLoaded = ref(false);

const changeLabel = computed(() =>
  t(`paymentMethods.${props.paymentSource.method}.changeLabel`)
);

function reset() {
  loading.value = false;
  stripeClientSecret.value = '';
  stripePaymentLoaded.value = false;
}

function onStripeLoaded() {
  stripePaymentLoaded.value = true;
  loading.value = false;
}

async function handleUpdate() {
  cantUpdate.value = false;
  loading.value = true;
  try {
    const data = await client.contact.payment.update();
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    } else if (data.clientSecret) {
      stripeClientSecret.value = data.clientSecret;
    }
  } catch (err) {
    loading.value = false;
    if (isApiError(err, ['cant-update-contribution'])) {
      cantUpdate.value = true;
    }
  }
}

onBeforeMount(reset);
</script>
