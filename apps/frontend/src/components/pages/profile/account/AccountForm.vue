<!--
  # AccountForm
  Member-only ("me") contact info + delivery address form. This is a
  deliberate fork of ContactUpdateAccount.vue: that component is shared with
  the admin "edit contact" screen, and restyling it in place would change
  the admin screen's look too. This component only ever edits the current
  user's own contact, so it drops the admin-only branches (newsletter opt-in,
  admin delivery-opt-in radio group) entirely.
-->
<template>
  <UForm
    id="account-form"
    ref="formRef"
    class="flex flex-col gap-6"
    :schema="schema"
    :state="data"
    @submit="handleSave"
  >
    <AppSectionCard
      icon="i-lucide-user-round"
      :title="t('accountPage.contactInformation')"
    >
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

      <UFormField :label="t('form.phone')" name="telephone">
        <UInput v-model="data.telephone" type="tel" class="w-full" />
        <p class="text-muted mt-1.5 flex items-center gap-1 text-xs">
          <UIcon name="i-lucide-info" class="size-3 shrink-0" />
          {{ t('accountPage.phoneInfo') }}
        </p>
      </UFormField>
    </AppSectionCard>

    <AppSectionCard
      icon="i-lucide-map-pin"
      :title="t('accountPage.deliveryAddress')"
    >
      <template v-if="accountContent.showMailOptIn">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-highlighted text-sm font-medium">
              {{ accountContent.mailTitle }}
            </p>
            <div
              class="content-message text-muted mt-0.5 text-xs"
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
    </AppSectionCard>

    <AppStickySaveBar v-if="dirty" form="account-form" @cancel="handleCancel" />
  </UForm>
</template>

<script lang="ts" setup>
import { GetContactWith, toPhoneNumber } from '@beabee/beabee-common';
import { AppSectionCard, AppStickySaveBar } from '@beabee/vue';

import { computed, reactive, ref, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

import { useApiSubmit } from '#composables/useApiSubmit';
import { client } from '#utils/api';

const { t } = useI18n();

const accountContent = await client.content.get('join/setup');
const contact = await client.contact.get('me', [GetContactWith.Profile]);

const data = reactive({
  emailAddress: contact.email,
  firstName: contact.firstname,
  lastName: contact.lastname,
  telephone: contact.profile.telephone,
  deliveryOptIn: contact.profile.deliveryOptIn,
  addressLine1: contact.profile.deliveryAddress?.line1 || '',
  addressLine2: contact.profile.deliveryAddress?.line2 as string | undefined,
  cityOrTown: contact.profile.deliveryAddress?.city || '',
  postCode: contact.profile.deliveryAddress?.postcode || '',
});

/** Snapshot of the last-saved (or initially loaded) values, for Cancel */
let savedData = { ...data };

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
      telephone: z
        .string()
        .refine(isValidPhone, { error: t('form.errors.telephone.phone') }),
      deliveryOptIn: z.boolean(),
      addressLine1: z.string(),
      cityOrTown: z.string(),
      postCode: z.string(),
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
);

const dirty = ref(false);

// UForm validates in response to DOM events (input/blur/change), not
// reactively off `:state` — a silent `Object.assign` (in handleCancel below)
// doesn't fire those events, so any already-shown errors would otherwise
// stay stuck on screen. `formRef.value.clear()` explicitly wipes them.
const formRef = useTemplateRef('formRef');

watch(
  data,
  () => {
    dirty.value = JSON.stringify(data) !== JSON.stringify(savedData);
  },
  { deep: true }
);

const { submit: handleSave } = useApiSubmit(
  async () => {
    await client.contact.update('me', {
      email: data.emailAddress,
      firstname: data.firstName,
      lastname: data.lastName,
      profile: {
        telephone: data.telephone,
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
    savedData = { ...data };
    dirty.value = false;
  },
  { successMessage: () => t('form.saved') }
);

function handleCancel() {
  Object.assign(data, savedData);
  formRef.value?.clear();
}
</script>
