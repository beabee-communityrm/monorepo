<template>
  <AppForm
    :button-text="t('actions.update')"
    :success-text="t('form.saved')"
    @submit="handleSubmit"
  >
    <AppHeading>{{ t('accountPage.contactInformation') }}</AppHeading>

    <ContactBasicFields
      v-model:email="data.emailAddress"
      v-model:firstName="data.firstName"
      v-model:lastName="data.lastName"
      :optional-names="isAdmin"
    />

    <template v-if="accountContent.showNewsletterOptIn && isAdmin">
      <AppHeading class="mt-6">
        {{ t('accountPage.newsletter.title') }}
      </AppHeading>

      <p class="mb-4">
        {{
          t('accountPage.newsletter.currentStatus.' + currentNewsletterStatus)
        }}
      </p>

      <AppNotification
        v-if="
          currentNewsletterStatus === NewsletterStatus.Cleaned ||
          currentNewsletterStatus === NewsletterStatus.Pending
        "
        variant="warning"
        :title="t('accountPage.newsletter.cantUpdate')"
      />
      <AppCheckbox
        v-else-if="currentNewsletterStatus === NewsletterStatus.Subscribed"
        v-model="data.newsletterToggle"
        :label="t('accountPage.newsletter.unsubscribe')"
      />
      <AppCheckbox
        v-else
        v-model="data.newsletterToggle"
        :label="t('accountPage.newsletter.subscribe')"
        class="mb-4"
      />
    </template>

    <AppHeading class="mt-6">
      {{ t('accountPage.deliveryAddress') }}
    </AppHeading>

    <template v-if="accountContent.showMailOptIn">
      <AppRadioGroup
        v-if="isAdmin"
        v-model="data.deliveryOptIn"
        name="deliveryOptIn"
        :label="t('accountPage.deliveryOptIn')"
        :options="[
          [true, t('common.yes')],
          [false, t('common.no')],
        ]"
        class="mb-4"
        inline
      />
      <ContactMailOptIn
        v-else
        v-model="data.deliveryOptIn"
        :content="accountContent"
      />
    </template>

    <AppAddress
      v-model:line1="data.addressLine1"
      v-model:line2="data.addressLine2"
      v-model:postCode="data.postCode"
      v-model:cityOrTown="data.cityOrTown"
      :required="data.deliveryOptIn"
    />
  </AppForm>
</template>
<script lang="ts" setup>
import { NewsletterStatus } from '@beabee/beabee-common';
import { computed, reactive, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppAddress from '../AppAddress.vue';
import ContactBasicFields from './ContactBasicFields.vue';
import ContactMailOptIn from './ContactMailOptIn.vue';
import AppHeading from '../AppHeading.vue';
import { fetchContent } from '../../utils/api/content';
import { fetchContact, updateContact } from '../../utils/api/contact';
import AppRadioGroup from '../forms/AppRadioGroup.vue';
import AppForm from '../forms/AppForm.vue';
import AppNotification from '../AppNotification.vue';
import AppCheckbox from '../forms/AppCheckbox.vue';

const props = defineProps<{
  id: string;
}>();

const { t } = useI18n();

const isAdmin = computed(() => props.id !== 'me');

const accountContent = await fetchContent('join/setup');

const currentNewsletterStatus = ref(NewsletterStatus.None);

const data = reactive({
  emailAddress: '',
  firstName: '',
  lastName: '',
  newsletterToggle: false,
  deliveryOptIn: false,
  addressLine1: '',
  addressLine2: '' as string | undefined,
  cityOrTown: '',
  postCode: '',
});

watch(
  toRef(props, 'id'),
  async (id) => {
    const contact = await fetchContact(id, ['profile']);

    data.emailAddress = contact.email;
    data.firstName = contact.firstname;
    data.lastName = contact.lastname;
    data.newsletterToggle = false;
    data.deliveryOptIn = contact.profile.deliveryOptIn;

    currentNewsletterStatus.value = contact.profile.newsletterStatus;

    const address = contact.profile.deliveryAddress;
    data.addressLine1 = address?.line1 || '';
    data.addressLine2 = address?.line2 || '';
    data.cityOrTown = address?.city || '';
    data.postCode = address?.postcode || '';
  },
  { immediate: true }
);

async function handleSubmit() {
  const newNewsletterStatus =
    data.newsletterToggle &&
    (currentNewsletterStatus.value === NewsletterStatus.Subscribed
      ? NewsletterStatus.Unsubscribed
      : NewsletterStatus.Subscribed);

  await updateContact(props.id, {
    email: data.emailAddress,
    firstname: data.firstName,
    lastname: data.lastName,
    profile: {
      // Only update newsletter status if the checkbox was ticked
      ...(newNewsletterStatus && {
        newsletterStatus: newNewsletterStatus,
      }),
      // Only update opt in if it's visible
      ...(accountContent.showMailOptIn && {
        deliveryOptIn: data.deliveryOptIn,
      }),
      deliveryAddress: {
        line1: data.addressLine1,
        line2: data.addressLine2,
        city: data.cityOrTown,
        postcode: data.postCode,
      },
    },
  });

  if (newNewsletterStatus) {
    currentNewsletterStatus.value = newNewsletterStatus;
    data.newsletterToggle = false;
  }
}
</script>
