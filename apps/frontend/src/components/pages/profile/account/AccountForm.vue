<!--
  # AccountForm
  Member-only ("me") contact info + delivery address form.
-->
<template>
  <UForm
    id="account-form"
    ref="formRef"
    class="flex flex-col gap-4"
    :schema="schema"
    :state="data"
    @submit="handleSave"
  >
    <AppSectionCard
      icon="i-lucide-user-round"
      :title="t('accountPage.personalDetails')"
    >
      <LoadError v-if="failed" :retry="retry" />
      <template v-else-if="loaded">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UFormField :label="t('form.firstName')" required name="firstName">
            <UInput v-model="data.firstName" class="w-full" />
          </UFormField>
          <UFormField :label="t('form.lastName')" required name="lastName">
            <UInput v-model="data.lastName" class="w-full" />
          </UFormField>
        </div>

        <UFormField :label="t('form.email')" required name="emailAddress">
          <UInput v-model="data.emailAddress" type="email" class="w-full" />
        </UFormField>

        <UFormField
          v-if="accountContent?.showOrganisationName"
          :label="t('adminSettings.general.organisationName')"
          name="organisation"
        >
          <UInput v-model="data.organisation" class="w-full" />
        </UFormField>

        <UFormField
          :label="t('form.phone')"
          name="telephone"
          :help="t('accountPage.phoneInfo-nuxt')"
        >
          <UInput v-model="data.telephone" type="tel" class="w-full" />
        </UFormField>

        <UFormField
          v-if="joinContent?.showVatNumber"
          :label="t('form.vatNumber')"
          name="vatNumber"
          :help="t('accountPage.vatNumberInfo')"
        >
          <UInput v-model="data.vatNumber" class="w-full" disabled />
        </UFormField>
      </template>
    </AppSectionCard>

    <AppSectionCard
      v-if="!failed"
      icon="i-lucide-map-pin"
      :title="t('accountPage.deliveryAddress')"
    >
      <template v-if="loaded">
        <template v-if="accountContent?.showMailOptIn">
          <div class="flex flex-col gap-4">
            <div class="space-y-1">
              <p class="text-sm font-medium text-default">
                {{ accountContent.mailTitle }}
              </p>
              <div
                class="text-sm text-muted"
                v-html="accountContent.mailText"
              />
            </div>
            <USwitch
              v-model="data.deliveryOptIn"
              :label="accountContent.mailOptIn"
            />
          </div>
        </template>

        <UFormField
          :label="t('form.addressLine1')"
          :required="data.deliveryOptIn"
          name="addressLine1"
        >
          <UInput v-model="data.addressLine1" class="w-full" />
        </UFormField>
        <UFormField :label="t('form.addressLine2')">
          <UInput v-model="data.addressLine2" class="w-full" />
        </UFormField>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
          <UFormField
            :label="t('form.cityOrTown')"
            :required="data.deliveryOptIn"
            name="cityOrTown"
          >
            <UInput v-model="data.cityOrTown" class="w-full" />
          </UFormField>
          <UFormField
            :label="t('form.postCode')"
            :required="data.deliveryOptIn"
            name="postCode"
          >
            <UInput v-model="data.postCode" class="w-full" />
          </UFormField>
        </div>
        <UFormField
          :label="t('form.country')"
          :required="data.deliveryOptIn"
          name="country"
        >
          <USelectMenu
            v-model="data.country"
            :items="countryItems"
            value-key="id"
            :placeholder="t('common.selectOne')"
            class="w-full"
          />
        </UFormField>
      </template>
    </AppSectionCard>

    <AppStickySaveBar v-if="dirty" form="account-form" @cancel="handleCancel" />
  </UForm>
</template>

<script lang="ts" setup>
import { toPhoneNumber } from '@beabee/beabee-common';
import { AppSectionCard, AppStickySaveBar, getCountryItems } from '@beabee/vue';

import { computed, reactive, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

import LoadError from '#components/LoadError.vue';
import {
  contactProfileQuery,
  joinContentQuery,
  joinSetupContentQuery,
} from '#components/pages/profile/account/use-account-data';
import { useApiSubmit } from '#composables/useApiSubmit';
import { useLazyQuery } from '#composables/useLazyQuery';
import { queryClient } from '#lib/query';
import { client } from '#utils/api';

const { t, locale } = useI18n();

const setupContent = useLazyQuery(joinSetupContentQuery);
const join = useLazyQuery(joinContentQuery);
const contact = useLazyQuery(contactProfileQuery('me'));

const accountContent = setupContent.data;
const joinContent = join.data;

/** Whether anything the form needs failed to load */
const failed = computed(
  () => setupContent.failed.value || join.failed.value || contact.failed.value
);

/** Whether everything the form needs has loaded */
const loaded = computed(
  () => !!accountContent.value && !!joinContent.value && !!contact.data.value
);

/** Loads what failed again; rejects if it still fails */
const retry = () =>
  Promise.all(
    [setupContent, join, contact]
      .filter((q) => q.failed.value)
      .map((q) => q.retry())
  );

const data = reactive({
  emailAddress: '',
  firstName: '',
  lastName: '',
  organisation: '',
  vatNumber: '',
  telephone: '',
  deliveryOptIn: false,
  addressLine1: '',
  addressLine2: '',
  cityOrTown: '',
  postCode: '',
  country: '',
});

const countryItems = computed(() => getCountryItems(locale.value));

/** Snapshot of the last-saved (or initially loaded) values, for Cancel */
const savedData = reactive({ ...data });

/** Whether the form has been filled from the contact. Only once, so a
 * refresh doesn't undo edits. */
let filled = false;

watch(
  contact.data,
  (loadedContact) => {
    if (!loadedContact || filled) return;
    filled = true;
    Object.assign(data, {
      emailAddress: loadedContact.email,
      firstName: loadedContact.firstname,
      lastName: loadedContact.lastname,
      organisation: loadedContact.profile.organisation,
      vatNumber: loadedContact.profile.vatNumber,
      telephone: loadedContact.profile.telephone,
      deliveryOptIn: loadedContact.profile.deliveryOptIn,
      addressLine1: loadedContact.profile.deliveryAddress?.line1 || '',
      addressLine2: loadedContact.profile.deliveryAddress?.line2 || '',
      cityOrTown: loadedContact.profile.deliveryAddress?.city || '',
      postCode: loadedContact.profile.deliveryAddress?.postcode || '',
      country: loadedContact.profile.deliveryAddress?.country || '',
    });
    Object.assign(savedData, data);
  },
  { immediate: true }
);

// Incomplete phone number validation
function isValidPhone(value: string): boolean {
  if (!value) return true; // Optional field
  return toPhoneNumber(value) !== false;
}

const schema = computed(() =>
  z
    .object({
      emailAddress: z
        .string()
        .min(1, { error: t('form.errors.email.required'), abort: true })
        .email({ error: t('form.errors.email.email') }),
      firstName: z
        .string()
        .min(1, { error: t('form.errors.firstName.required') }),
      lastName: z
        .string()
        .min(1, { error: t('form.errors.lastName.required') }),
      organisation: z.string(),
      vatNumber: z.string(),
      telephone: z
        .string()
        .refine(isValidPhone, { error: t('form.errors.telephone.phone') }),
      deliveryOptIn: z.boolean(),
      addressLine1: z.string(),
      cityOrTown: z.string(),
      postCode: z.string(),
      country: z.string(),
    })
    .refine((input) => !input.deliveryOptIn || !!input.addressLine1, {
      error: t('form.errors.addressLine1.required'),
      path: ['addressLine1'],
    })
    .refine((input) => !input.deliveryOptIn || !!input.cityOrTown, {
      error: t('form.errors.cityOrTown.required'),
      path: ['cityOrTown'],
    })
    .refine((input) => !input.deliveryOptIn || !!input.postCode, {
      error: t('form.errors.postCode.required'),
      path: ['postCode'],
    })
    .refine((input) => !input.deliveryOptIn || !!input.country, {
      error: t('form.errors.country.required'),
      path: ['country'],
    })
);

// UForm validates in response to DOM events (input/blur/change), not
// reactively off `:state` — a silent `Object.assign` (in handleCancel below)
// doesn't fire those events, so any already-shown errors would otherwise
// stay stuck on screen. `formRef.value.clear()` explicitly wipes them.
const formRef = useTemplateRef('formRef');

const dirty = computed(
  () =>
    data.emailAddress !== savedData.emailAddress ||
    data.firstName !== savedData.firstName ||
    data.lastName !== savedData.lastName ||
    data.organisation !== savedData.organisation ||
    data.telephone !== savedData.telephone ||
    data.deliveryOptIn !== savedData.deliveryOptIn ||
    data.addressLine1 !== savedData.addressLine1 ||
    data.addressLine2 !== savedData.addressLine2 ||
    data.cityOrTown !== savedData.cityOrTown ||
    data.postCode !== savedData.postCode ||
    data.country !== savedData.country
);

const { submit: handleSave } = useApiSubmit(
  async () => {
    await client.contact.update('me', {
      email: data.emailAddress,
      firstname: data.firstName,
      lastname: data.lastName,
      profile: {
        organisation: data.organisation,
        telephone: data.telephone,
        // Only update opt in if it's visible
        ...(accountContent.value?.showMailOptIn && {
          deliveryOptIn: data.deliveryOptIn,
        }),
        deliveryAddress: {
          line1: data.addressLine1,
          line2: data.addressLine2,
          city: data.cityOrTown,
          postcode: data.postCode,
          country: data.country,
        },
      },
    });
    Object.assign(savedData, data);
    queryClient.invalidateQueries(contactProfileQuery('me'));
  },
  { successMessage: () => t('form.saved') }
);

function handleCancel() {
  Object.assign(data, savedData);
  formRef.value?.clear();
}
</script>
