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

    <Teleport to="#account-page">
      <div
        v-if="dirty"
        class="border-default bg-default sticky bottom-0 z-20 -mx-4 w-auto border-t md:-mx-5"
      >
        <div
          class="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
        >
          <p class="text-muted text-sm">
            {{ t('accountPage.unsavedChanges') }}
          </p>
          <div class="flex items-center gap-2">
            <UButton
              type="button"
              variant="outline"
              color="neutral"
              @mousedown.prevent
              @click="handleCancel"
            >
              {{ t('actions.cancel') }}
            </UButton>
            <UButton
              type="button"
              :loading="saving"
              :icon="saved ? 'i-lucide-check' : undefined"
              @click="formRef?.submit()"
            >
              {{ saved ? t('form.saved') : t('form.saveChanges') }}
            </UButton>
          </div>
        </div>
      </div>
    </Teleport>
  </UForm>
</template>

<script lang="ts" setup>
import { GetContactWith, toPhoneNumber } from '@beabee/beabee-common';
import { AppSectionCard, addNotification } from '@beabee/vue';

import * as v from 'valibot';
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

// Kept exactly as-is (deferred improvement, see project memory note on the
// known phone-validation gap) — not part of this validation-layer migration.
function isValidPhone(value: string): boolean {
  if (!value) return true; // Optional field
  return toPhoneNumber(value) !== false;
}

const schema = computed(() =>
  v.pipe(
    v.object({
      emailAddress: v.pipe(
        v.string(),
        v.nonEmpty(t('form.errors.email.required')),
        v.rfcEmail(t('form.errors.email.email'))
      ),
      firstName: v.pipe(
        v.string(),
        v.nonEmpty(t('form.errors.firstName.required'))
      ),
      lastName: v.pipe(
        v.string(),
        v.nonEmpty(t('form.errors.lastName.required'))
      ),
      telephone: v.pipe(
        v.string(),
        v.check(isValidPhone, t('form.errors.telephone.phone'))
      ),
      deliveryOptIn: v.boolean(),
      addressLine1: v.string(),
      cityOrTown: v.string(),
      postCode: v.string(),
    }),
    v.forward(
      v.partialCheck(
        [['deliveryOptIn'], ['addressLine1']],
        (input) => !input.deliveryOptIn || !!input.addressLine1,
        t('form.errors.addressLine1.required')
      ),
      ['addressLine1']
    ),
    v.forward(
      v.partialCheck(
        [['deliveryOptIn'], ['cityOrTown']],
        (input) => !input.deliveryOptIn || !!input.cityOrTown,
        t('form.errors.cityOrTown.required')
      ),
      ['cityOrTown']
    ),
    v.forward(
      v.partialCheck(
        [['deliveryOptIn'], ['postCode']],
        (input) => !input.deliveryOptIn || !!input.postCode,
        t('form.errors.postCode.required')
      ),
      ['postCode']
    )
  )
);

const dirty = ref(false);
const saving = ref(false);
const saved = ref(false);

// UForm validates in response to DOM events (input/blur/change), not
// reactively off `:state` — a silent `Object.assign` (in handleCancel below)
// doesn't fire those events, so any already-shown errors would otherwise
// stay stuck on screen. `formRef.value.clear()` explicitly wipes them.
// `formRef.value.submit()` is also used directly by the Save button: it's
// Teleported out of the `<form>` DOM subtree for sticky positioning, so it
// has no native form association for a real `type="submit"` click to reach.
const formRef = ref<{ clear: () => void; submit: () => Promise<void> } | null>(
  null
);

watch(
  data,
  () => {
    dirty.value = true;
    saved.value = false;
  },
  { deep: true }
);

async function handleSave() {
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
    addNotification({ title: t('form.saved'), variant: 'success' });
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
  formRef.value?.clear();
  // Wait for the deep `watch(data, ...)` above to react to the assignment
  // (and re-mark dirty) before clearing it, otherwise that watcher's queued
  // update would run after this and flip dirty back to true.
  await nextTick();
  dirty.value = false;
}
</script>
