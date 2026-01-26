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
        :return-url="client.contact.paymentMethod.completeUrl"
        @loaded="onStripeLoaded"
      />
    </AppModal>
  </div>
</template>

<script lang="ts" setup>
import type { PaymentSource, PaymentSourceManual } from '@beabee/beabee-common';
import { AppButton, AppHeading, AppModal, AppNotification } from '@beabee/vue';

import StripePayment from '@components/StripePayment.vue';
import { PaymentMethod } from '@components/payment';
import type { StripePaymentData } from '@type/stripe-payment-data';
import { client, isApiError } from '@utils/api';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

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
    const data = await client.contact.paymentMethod.update();
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
