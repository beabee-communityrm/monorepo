<route lang="yaml">
name: adminContactsViewContribution
meta:
  pageTitle: menu.contacts
  role: admin
</route>

<template>
  <App2ColGrid>
    <template #col1>
      <AppHeading>
        {{ t('contribution.updateContribution') }}
      </AppHeading>
      <template v-if="contributionData && contributionInfo">
        <AppApiForm
          v-if="
            contributionInfo.type === ContributionType.Manual ||
            contributionInfo.type === ContributionType.None
          "
          :button-text="t('contribution.updateContribution')"
          :success-text="t('form.saved')"
          @submit="handleUpdateContribution"
        >
          <ContactContributionFields v-model="contributionData" />
        </AppApiForm>
        <template v-else>
          <AppNotification
            variant="warning"
            class="mb-6"
            :title="t('contactContribution.updateNotice.title')"
          >
            {{ t('contactContribution.updateNotice.text') }}
          </AppNotification>

          <ContactCancelContribution
            :id="contact.id"
            :contribution="contributionInfo"
            @cancel="showCancelDialog = true"
          />
          <AppConfirmDialog
            :open="showCancelDialog"
            :title="t('contactContribution.confirmCancel.title')"
            :confirm="t('contactContribution.confirmCancel.confirm')"
            :cancel="t('actions.noBack')"
            @close="showCancelDialog = false"
            @confirm="handleCancelContribution"
          >
            <p>{{ t('contactContribution.confirmCancel.text') }}</p>
          </AppConfirmDialog>
        </template>
      </template>
    </template>
    <template #col2>
      <ContactPaymentsHistory :id="contact.id" />
    </template>
  </App2ColGrid>
</template>
<script lang="ts" setup>
import {
  type ContributionInfo,
  ContributionType,
  type GetContactData,
  GetContactWith,
} from '@beabee/beabee-common';
import {
  App2ColGrid,
  AppConfirmDialog,
  AppHeading,
  AppNotification,
} from '@beabee/vue';

import ContactCancelContribution from '@components/contact/ContactCancelContribution.vue';
import ContactContributionFields from '@components/contact/ContactContributionFields.vue';
import ContactPaymentsHistory from '@components/contact/ContactPaymentsHistory.vue';
import type { UpdateContribution } from '@components/contact/contact.interface';
import AppApiForm from '@components/forms/AppApiForm.vue';
import { client } from '@utils/api';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();

const props = defineProps<{ contact: GetContactData }>();

const router = useRouter();

const contributionInfo = ref<ContributionInfo>();
const contributionData = ref<UpdateContribution>();
const showCancelDialog = ref(false);

onBeforeMount(async () => {
  const contact = await client.contact.get(props.contact.id, [
    GetContactWith.Contribution,
  ]);

  contributionInfo.value = contact.contribution;
  contributionData.value = {
    type: contact.contribution.type,
    amount: contact.contribution.amount,
    period: contact.contribution.period,
    ...(contact.contribution.paymentSource?.method === null
      ? {
          source: contact.contribution.paymentSource.source,
          reference: contact.contribution.paymentSource.reference,
        }
      : {
          source: undefined,
          reference: undefined,
        }),
  };
});

async function handleUpdateContribution() {
  if (!contributionData.value) return; // Can't submit without contribution laoded

  if (contributionData.value.type === ContributionType.None) {
    // Save empty values, not what is currently in the form
    await client.contact.contribution.forceUpdate(props.contact.id, {
      type: ContributionType.None,
      amount: undefined,
      period: undefined,
    });
  } else if (contributionData.value.type === ContributionType.Manual) {
    await client.contact.contribution.forceUpdate(props.contact.id, {
      ...contributionData.value,
      type: ContributionType.Manual, // Why doesn't TS narrow this type?
    });
  }
}

async function handleCancelContribution() {
  await client.contact.contribution.cancel(props.contact.id);
  showCancelDialog.value = false;
  router.push({ path: '/admin/contacts/' + props.contact.id });
}
</script>
