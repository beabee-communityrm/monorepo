<route lang="yaml">
name: confirmEmailLoading
meta:
  layout: Loading
  noAuth: true
  pageTitle: pageTitle.confirmEmail
</route>
<template><div /></template>

<script lang="ts" setup>
import { PaymentRequiresActionError } from '@beabee/client';
import { addNotification } from '@beabee/vue/store/notifications';

import { onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { client } from '#utils/api';
import { extractErrorText, handleJoinError } from '#utils/api-error';
import { handlePaymentNextAction } from '#utils/payment';

import { generalContent, updateCurrentUser } from '../../../store';

const route = useRoute();
const router = useRouter();

/**
 * The account exists and is logged in at this point, only the first payment
 * still needs authenticating. Stripe expires the subscription if this never
 * completes, so a failed challenge just continues to the setup page.
 */
async function authenticateFirstPayment(clientSecret: string) {
  try {
    const { stripePublicKey } = await client.content.get('payment');
    await handlePaymentNextAction(clientSecret, stripePublicKey);
  } catch (err) {
    addNotification({ variant: 'error', title: extractErrorText(err) });
  }
}

onBeforeMount(async () => {
  try {
    await client.signup.confirmEmail(route.params.id).catch(async (err) => {
      if (!(err instanceof PaymentRequiresActionError)) {
        throw err;
      }
      await authenticateFirstPayment(err.clientSecret);
    });
    // With OIDC login the member sets up their credential at the identity
    // provider inside a login that returns to the setup page
    if (generalContent.value.oidcEnabled) {
      window.location.href = client.auth.getLoginUrl(
        '/join/setup',
        'setupCredential'
      );
      return;
    }
    // User has been logged in, update our current user to reflect this
    await updateCurrentUser();
    router.replace('/join/setup');
  } catch (err) {
    handleJoinError(err, router);
  }
});
</script>
