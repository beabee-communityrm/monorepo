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
        :email="email"
        :return-url="updatePaymentMethodCompleteUrl"
        @loaded="onStripeLoaded"
      />
    </AppModal>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import AppButton from '@components/button/AppButton.vue';
import StripePayment from '@components/StripePayment.vue';
import AppModal from '@components/AppModal.vue';
import AppHeading from '@components/AppHeading.vue';
import PaymentMethod from '@components/payment-method/PaymentMethod.vue';
import AppNotification from '@components/AppNotification.vue';

import {
  updatePaymentMethod,
  updatePaymentMethodCompleteUrl,
} from '@utils/api/contact';
import { isRequestError } from '@utils/api';

import type { PaymentSourceManual, PaymentSource } from '@beabee/beabee-common';

const { t } = useI18n();

const props = defineProps<{
  stripePublicKey: string;
  paymentSource: Exclude<PaymentSource, PaymentSourceManual>;
  email: string;
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
    const data = await updatePaymentMethod();
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    } else if (data.clientSecret) {
      stripeClientSecret.value = data.clientSecret;
    }
  } catch (err) {
    loading.value = false;
    if (isRequestError(err, ['cant-update-contribution'])) {
      cantUpdate.value = true;
    }
  }
}

onBeforeMount(reset);
</script>
