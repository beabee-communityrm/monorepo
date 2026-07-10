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
  <AppSectionCard
    icon="i-lucide-user-round"
    :title="t('accountPage.contactInformation')"
  >
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <UFormField
        :label="t('form.firstName')"
        required
        :error="errorFor('firstName')"
      >
        <UInput
          v-model="data.firstName"
          class="w-full"
          @blur="v$.firstName.$touch"
          @update:model-value="v$.firstName.$reset()"
        />
      </UFormField>
      <UFormField
        :label="t('form.lastName')"
        required
        :error="errorFor('lastName')"
      >
        <UInput
          v-model="data.lastName"
          class="w-full"
          @blur="v$.lastName.$touch"
          @update:model-value="v$.lastName.$reset()"
        />
      </UFormField>
    </div>

    <UFormField
      :label="t('form.email')"
      required
      :error="errorFor('emailAddress')"
    >
      <UInput
        v-model="data.emailAddress"
        type="email"
        class="w-full"
        @blur="v$.emailAddress.$touch"
        @update:model-value="v$.emailAddress.$reset()"
      />
    </UFormField>

    <UFormField :label="t('form.phone')" :error="errorFor('telephone')">
      <UInput
        v-model="data.telephone"
        type="tel"
        class="w-full"
        @blur="v$.telephone.$touch"
        @update:model-value="v$.telephone.$reset()"
      />
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
      :error="errorFor('addressLine1')"
    >
      <UInput
        v-model="data.addressLine1"
        class="w-full"
        @blur="v$.addressLine1.$touch"
        @update:model-value="v$.addressLine1.$reset()"
      />
    </UFormField>
    <UFormField :label="t('form.addressLine2')">
      <UInput v-model="data.addressLine2" class="w-full" />
    </UFormField>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
      <UFormField
        :label="t('form.cityOrTown')"
        :required="data.deliveryOptIn"
        :error="errorFor('cityOrTown')"
      >
        <UInput
          v-model="data.cityOrTown"
          class="w-full"
          @blur="v$.cityOrTown.$touch"
          @update:model-value="v$.cityOrTown.$reset()"
        />
      </UFormField>
      <UFormField
        :label="t('form.postCode')"
        :required="data.deliveryOptIn"
        :error="errorFor('postCode')"
      >
        <UInput
          v-model="data.postCode"
          class="w-full"
          @blur="v$.postCode.$touch"
          @update:model-value="v$.postCode.$reset()"
        />
      </UFormField>
    </div>
  </AppSectionCard>

  <Teleport to="#account-page">
    <div
      v-if="dirty"
      class="border-default bg-default sticky bottom-0 z-20 -mx-4 w-auto border-t md:-mx-5"
    >
      <div
        class="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
      >
        <p class="text-muted text-sm">{{ t('accountPage.unsavedChanges') }}</p>
        <div class="flex items-center gap-2">
          <UButton
            variant="outline"
            color="neutral"
            @mousedown.prevent
            @click="handleCancel"
          >
            {{ t('actions.cancel') }}
          </UButton>
          <UButton
            :loading="saving"
            :disabled="v$.$invalid"
            :icon="saved ? 'i-lucide-check' : undefined"
            @click="handleSave"
          >
            {{ saved ? t('form.saved') : t('form.saveChanges') }}
          </UButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { GetContactWith, toPhoneNumber } from '@beabee/beabee-common';
import { AppSectionCard, addNotification } from '@beabee/vue';

import useVuelidate from '@vuelidate/core';
import { email, helpers, required, requiredIf } from '@vuelidate/validators';
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { extractErrorText } from '#utils/api-error';
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

function isValidPhone(value: string): boolean {
  if (!value) return true; // Optional field
  return toPhoneNumber(value) !== false;
}

const rules = computed(() => ({
  emailAddress: {
    required: helpers.withMessage(t('form.errors.email.required'), required),
    email: helpers.withMessage(t('form.errors.email.email'), email),
  },
  firstName: {
    required: helpers.withMessage(
      t('form.errors.firstName.required'),
      required
    ),
  },
  lastName: {
    required: helpers.withMessage(t('form.errors.lastName.required'), required),
  },
  telephone: {
    phone: helpers.withMessage(t('form.errors.telephone.phone'), isValidPhone),
  },
  addressLine1: {
    required: helpers.withMessage(
      t('form.errors.addressLine1.required'),
      requiredIf(() => data.deliveryOptIn)
    ),
  },
  cityOrTown: {
    required: helpers.withMessage(
      t('form.errors.cityOrTown.required'),
      requiredIf(() => data.deliveryOptIn)
    ),
  },
  postCode: {
    required: helpers.withMessage(
      t('form.errors.postCode.required'),
      requiredIf(() => data.deliveryOptIn)
    ),
  },
}));

const v$ = useVuelidate(rules, data);

function errorFor(field: keyof typeof rules.value): string | undefined {
  return v$.value[field]?.$errors[0]?.$message as string | undefined;
}

const dirty = ref(false);
const saving = ref(false);
const saved = ref(false);

watch(
  data,
  () => {
    dirty.value = true;
    saved.value = false;
  },
  { deep: true }
);

async function handleSave() {
  v$.value.$touch();
  if (v$.value.$invalid) return;

  saving.value = true;
  try {
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
    saved.value = true;
    dirty.value = false;
    setTimeout(() => {
      saved.value = false;
    }, 3000);
  } catch (err) {
    addNotification({ title: extractErrorText(err), variant: 'error' });
  } finally {
    saving.value = false;
  }
}

async function handleCancel() {
  Object.assign(data, savedData);
  v$.value.$reset();
  // Wait for the deep `watch(data, ...)` above to react to the assignment
  // (and re-mark dirty) before clearing it, otherwise that watcher's queued
  // update would run after this and flip dirty back to true.
  await nextTick();
  dirty.value = false;
}
</script>
