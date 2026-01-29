<template>
  <AppApiForm
    :button-text="t('form.saveChanges')"
    :success-text="t('form.updated')"
    @submit="handleSubmit"
  >
    <AppHeading>{{ t('accountPage.contactInformation') }}</AppHeading>

    <ContactBasicFields
      v-model:email="data.emailAddress"
      v-model:first-name="data.firstName"
      v-model:last-name="data.lastName"
      :optional-names="isAdmin"
    />

    <div class="mb-3">
      <AppInput
        v-model="data.telephone"
        :label="t('form.phone')"
        :info-message="
          isAdmin ? t('accountPage.phoneInfoAdmin') : t('accountPage.phoneInfo')
        "
      />
    </div>

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
      v-model:post-code="data.postCode"
      v-model:city-or-town="data.cityOrTown"
      :required="data.deliveryOptIn"
    />
  </AppApiForm>
</template>
<script lang="ts" setup>
import { GetContactWith, NewsletterStatus } from '@beabee/beabee-common';
import { AppAddress, AppInput } from '@beabee/vue';
import { AppCheckbox, AppNotification, AppRadioGroup } from '@beabee/vue';
import { AppHeading } from '@beabee/vue';

import AppApiForm from '@components/forms/AppApiForm.vue';
import { client } from '@utils/api';
import { computed, reactive, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ContactBasicFields from './ContactBasicFields.vue';
import ContactMailOptIn from './ContactMailOptIn.vue';

const props = defineProps<{
  id: string;
}>();

const { t } = useI18n();

const isAdmin = computed(() => props.id !== 'me');

const accountContent = await client.content.get('join/setup');

const currentNewsletterStatus = ref(NewsletterStatus.None);

const data = reactive({
  emailAddress: '',
  firstName: '',
  lastName: '',
  telephone: '',
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
    const contact = await client.contact.get(id, [GetContactWith.Profile]);

    data.emailAddress = contact.email;
    data.firstName = contact.firstname;
    data.lastName = contact.lastname;
    data.telephone = contact.profile.telephone;
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

  await client.contact.update(props.id, {
    email: data.emailAddress,
    firstname: data.firstName,
    lastname: data.lastName,
    profile: {
      telephone: data.telephone,
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
