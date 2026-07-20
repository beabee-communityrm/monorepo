<!--
  # SetMFA
  This component is used to set up MFA for a contact, via a two-step
  enable-MFA modal (scan QR code, then verify the code) and a separate
  disable-MFA confirmation modal.

  ## Props
  - `contactId` (string): The id of the contact to set up MFA for.

  ## Possible improvements
  - Add support for other MFA types (e.g. SMS)

-->

<template>
  <AppSectionCard
    icon="i-lucide-shield-check"
    :title="t('accountPage.mfa.title')"
    :description="t('accountPage.mfa.description')"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <p class="font-medium">
          {{
            isEnabled
              ? t('accountPage.mfa.statusEnabled.title')
              : t('accountPage.mfa.statusDisabled.title')
          }}
        </p>
        <p class="text-muted">
          {{
            isEnabled
              ? t('accountPage.mfa.statusEnabled.description')
              : t('accountPage.mfa.statusDisabled.description')
          }}
        </p>
      </div>
      <USwitch
        :model-value="isEnabled"
        :aria-label="t('accountPage.mfa.title')"
        @update:model-value="onSwitchToggle"
      />
    </div>
  </AppSectionCard>

  <UModal
    :open="showDisableConfirmModal"
    :ui="{ header: 'min-h-[3rem]', close: 'top-2' }"
    @update:open="(open: boolean) => !open && closeDisableConfirmModal()"
    @after:leave="blurActiveElement"
  >
    <template #body>
      <div class="flex flex-col gap-6">
        <div class="space-y-2">
          <h2>
            {{ t('accountPage.mfa.confirmDelete.title') }}
          </h2>
          <p class="text-muted">
            {{ t('accountPage.mfa.confirmDelete.descDetail') }}
          </p>
        </div>
        <UFormField :label="t('accountPage.mfa.confirmDelete.descToken')">
          <AppCodeInput
            v-model="disableToken"
            :error="disableError"
            class="justify-start"
            autofocus
          />
        </UFormField>

        <UAlert
          v-if="disableError || disableUnknownError"
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          :title="
            disableError
              ? t('accountPage.mfa.result.invalidCode')
              : t('accountPage.mfa.deleteUnknownErrorNotification')
          "
        />

        <AppModalActions
          :cancel-label="t('accountPage.mfa.confirmDelete.keepEnabled')"
          :confirm-label="t('accountPage.mfa.confirmDelete.remove')"
          confirm-color="error"
          :confirm-disabled="disableToken.length < 6"
          :confirm-loading="disabling"
          @cancel="closeDisableConfirmModal"
          @confirm="handleDisableClick"
        />
      </div>
    </template>
  </UModal>

  <AppModalDialog
    :open="showMFASettingsModal"
    icon="i-lucide-shield-check"
    :title="t('accountPage.mfa.modalTitle')"
    :description="
      t('accountPage.mfa.stepIndicator', {
        step: enableStep === 'scan' ? 1 : 2,
        total: 2,
      })
    "
    @update:open="(open: boolean) => !open && onCloseMFAModal()"
    @after:leave="blurActiveElement"
  >
    <div class="flex gap-1">
      <div class="bg-primary h-1 flex-1 rounded-full" />
      <div
        class="h-1 flex-1 rounded-full"
        :class="enableStep === 'verify' ? 'bg-primary' : 'bg-elevated'"
      />
    </div>

    <div class="flex flex-col items-center gap-6 text-center">
      <!-- Scan QR code step -->
      <div v-if="enableStep === 'scan'" class="flex w-full flex-col gap-6">
        <div class="space-y-2">
          <h3 class="font-medium">
            {{ t('accountPage.mfa.scan.title') }}
          </h3>
          <p class="text-muted">
            {{ t('accountPage.mfa.scan.desc') }}
          </p>
        </div>

        <div class="flex flex-col gap-4">
          <div
            v-if="totpUrl"
            class="border-default mx-auto rounded-2xl border bg-white p-3 shadow-sm"
          >
            <div class="w-60">
              <AppQRCode :qr-data="totpUrl" />
            </div>
          </div>

          <div>
            <UButton
              variant="link"
              color="primary"
              size="xs"
              icon="i-lucide-key-round"
              @click="showSecret = !showSecret"
            >
              {{
                showSecret
                  ? t('accountPage.mfa.secretInput.toggleHide')
                  : t('accountPage.mfa.secretInput.toggleShow')
              }}
            </UButton>

            <div v-if="showSecret" class="mt-2">
              <UFormField>
                <UInput
                  :model-value="formattedTotpSecret"
                  readonly
                  class="w-full font-mono"
                >
                  <template #trailing>
                    <UTooltip
                      :text="t('actions.copy')"
                      :content="{ side: 'right' }"
                    >
                      <UButton
                        :color="secretCopied ? 'success' : 'neutral'"
                        variant="link"
                        size="xs"
                        :icon="
                          secretCopied ? 'i-lucide-copy-check' : 'i-lucide-copy'
                        "
                        :aria-label="t('actions.copy')"
                        @click="copySecret(totpSecret.base32)"
                      />
                    </UTooltip>
                  </template>
                </UInput>
              </UFormField>
            </div>
          </div>
        </div>
      </div>

      <!-- Verify code step -->
      <div v-else class="flex w-full flex-col gap-6">
        <div class="space-y-2">
          <h3 id="mfa-enter-code-title" class="font-medium">
            {{ t('accountPage.mfa.enterCode.title') }}
          </h3>
          <p id="mfa-enter-code-desc" class="text-muted">
            {{ t('accountPage.mfa.enterCode.desc') }}
          </p>
        </div>

        <AppCodeInput
          v-model="pin"
          :error="createError"
          class="justify-center"
          aria-labelledby="mfa-enter-code-title"
          aria-describedby="mfa-enter-code-desc"
          autofocus
        />

        <UAlert
          v-if="createError || createUnknownError"
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          :title="
            createError
              ? t('accountPage.mfa.result.invalidCode')
              : t('accountPage.mfa.createUnknownErrorNotification')
          "
        />
      </div>
    </div>

    <template #actions>
      <AppModalActions
        v-if="enableStep === 'scan'"
        :cancel-label="t('actions.cancel')"
        :confirm-label="t('actions.next')"
        @cancel="onCloseMFAModal"
        @confirm="enableStep = 'verify'"
      />
      <AppModalActions
        v-else
        :cancel-label="t('actions.back')"
        :confirm-label="t('accountPage.mfa.validateButton.label')"
        :confirm-disabled="pin.length < 6"
        :confirm-loading="creating"
        @cancel="resetEnableState"
        @confirm="handleCompleteSetup"
      />
    </template>
  </AppModalDialog>
</template>

<script lang="ts" setup>
import {
  CONTACT_MFA_TYPE,
  GetContactWith,
  LOGIN_CODES,
} from '@beabee/beabee-common';
import { UnauthorizedError } from '@beabee/client';
import {
  AppCodeInput,
  AppModalActions,
  AppModalDialog,
  AppQRCode,
  AppSectionCard,
  addNotification,
} from '@beabee/vue';

import { useClipboard } from '@vueuse/core';
import { Secret, TOTP } from 'otpauth';
import { computed, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { generalContent } from '#store/index';
import type { SetMfaTotpIdentity } from '#type/set-mfa-totp-identity';
import { client } from '#utils/api';

const { t } = useI18n();

/** Used to show/hide the modal */
const showMFASettingsModal = ref(false);

const showDisableConfirmModal = ref(false);

/** Is multi factor authentication enabled? */
const isEnabled = ref(false);

/** Which step of the enable-MFA modal is showing */
const enableStep = ref<'scan' | 'verify'>('scan');

/** Whether the manual-entry secret code is expanded */
const showSecret = ref(false);

/** Code entered on the verify step, one digit per box */
const pin = ref<string[]>([]);

/** Loading state while confirming the enable-2FA code */
const creating = ref(false);

/** Shown when the server rejects the entered code */
const createError = ref(false);

/** Shown when creating MFA fails for a reason other than an invalid code */
const createUnknownError = ref(false);

const props = defineProps<{
  contactId: string;
}>();

/** Authenticator app url to scan (otpauth://totp/...) */
const totpUrl = ref<string | undefined>(undefined);

/** Information about the app totp is set up for */
const totpIdentity = ref<SetMfaTotpIdentity>({
  issuer: undefined,
  label: undefined,
});

/** Secret used to generate totp */
const totpSecret = ref(new Secret());

/** Secret, displayed in groups of 4 characters for readability */
const formattedTotpSecret = computed(() =>
  totpSecret.value.base32.match(/.{1,4}/g)?.join('-')
);

/** Copy the secret to the clipboard, with `secretCopied` as icon feedback */
const { copy: copySecret, copied: secretCopied } = useClipboard();

/** Token entered to verify totp when disabling MFA, one digit per box */
const disableToken = ref<string[]>([]);

/** Shown when the server rejects the entered disable token */
const disableError = ref(false);

/** Shown when disabling MFA fails for a reason other than an invalid token */
const disableUnknownError = ref(false);

/** Loading state while confirming the disable-2FA dialog */
const disabling = ref(false);

/** Called when the status switch is toggled by the user */
const onSwitchToggle = () => {
  if (isEnabled.value) {
    showDisableConfirmModal.value = true;
  } else {
    showMFASettingsModal.value = true;
  }
};

/** Called when the modal is closed */
const onCloseMFAModal = () => {
  closeMFAModal();
  resetEnableState();
};

/** Called when the disable confirm modal is closed */
const closeDisableConfirmModal = () => {
  showDisableConfirmModal.value = false;
  resetDisableState();
};

/** Close the modal */
const closeMFAModal = () => {
  showMFASettingsModal.value = false;
};

/**
 * Create MFA for the contact
 * @returns Was creating MFA successful?
 */
const createMfa = async () => {
  try {
    await client.contact.mfa.create(props.contactId, {
      secret: totpSecret.value.base32,
      token: pin.value.join(''),
      type: CONTACT_MFA_TYPE.TOTP,
    });
  } catch (error) {
    onCreateError(error);
    return false;
  }
  return true;
};

/**
 * Disable MFA for the contact
 * @returns Was disabling MFA successful?
 */
const disableMfa = async () => {
  try {
    await client.contact.mfa.delete(props.contactId, {
      type: CONTACT_MFA_TYPE.TOTP,
      token: disableToken.value.join(''),
    });
  } catch (error) {
    onDeleteError(error);
    return false;
  }
  isEnabled.value = false;
  resetDisableState();
  return true;
};

/** Save MFA on server and notify the user */
const createMfaAndNotify = async () => {
  const success = await createMfa();
  if (!success) {
    return;
  }

  isEnabled.value = true;
  closeMFAModal();
  resetEnableState();
  addNotification({
    title: t('accountPage.mfa.enabledNotification'),
    variant: 'success',
  });
};

/** Disable MFA and notify the user */
const disableMfaAndNotify = async () => {
  const success = await disableMfa();
  if (!success) {
    return;
  }

  closeDisableConfirmModal();

  addNotification({
    title: t('accountPage.mfa.disabledNotification'),
    variant: 'warning',
  });
};

/**
 * Reka UI's Dialog restores focus to whatever opened it (the status switch)
 * once its close transition finishes, leaving it visibly focused. Blur it
 * once that happens.
 */
const blurActiveElement = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};

/** Called when the disable confirm button is clicked (adds a loading state) */
const handleDisableClick = async () => {
  disabling.value = true;
  await disableMfaAndNotify();
  disabling.value = false;
};

/** Called when the verify step's Save button is clicked, or the pin is completed */
const handleCompleteSetup = async () => {
  if (pin.value.length < 6 || creating.value) return;

  createError.value = false;
  createUnknownError.value = false;
  creating.value = true;
  await createMfaAndNotify();
  creating.value = false;
};

/** Called when an error occurs while creating MFA */
const onCreateError = (error: unknown) => {
  if (
    error instanceof UnauthorizedError &&
    error.code === LOGIN_CODES.INVALID_TOKEN
  ) {
    // If server says the token is invalid, show an inline error and let the
    // user retry on the same step
    createError.value = true;
    createUnknownError.value = false;
    return;
  }

  // Show an inline error and let the user retry on the same step
  createUnknownError.value = true;
  createError.value = false;
};

const onDeleteError = (error: unknown) => {
  if (
    error instanceof UnauthorizedError &&
    (error.code === LOGIN_CODES.INVALID_TOKEN ||
      error.code === LOGIN_CODES.MISSING_TOKEN)
  ) {
    // If server says the token is invalid, show an inline error
    disableError.value = true;
    disableUnknownError.value = false;
    return;
  }

  disableUnknownError.value = true;
  disableError.value = false;
};

/** Reset the enable-MFA modal back to its first step */
const resetEnableState = () => {
  enableStep.value = 'scan';
  pin.value = [];
  createError.value = false;
  createUnknownError.value = false;
  showSecret.value = false;
};

/** Reset the disable-MFA modal's form state */
const resetDisableState = () => {
  disableToken.value = [];
  disableError.value = false;
  disableUnknownError.value = false;
};

/** Called when the totp identity changes */
const onTotpIdentityChanged = (newValue: SetMfaTotpIdentity) => {
  totpSecret.value = new Secret();
  const totp = new TOTP({
    issuer: newValue.issuer,
    label: newValue.label,
    secret: totpSecret.value,
  });
  totpUrl.value = totp.toString();
};

/** Fetch the contact and set the TOTP identity */
watch(
  toRef(props, 'contactId'),
  async (contactId) => {
    const contact = await client.contact.get(contactId, [
      GetContactWith.Profile,
    ]);
    totpIdentity.value.issuer =
      generalContent.value.organisationName || 'beabee';
    totpIdentity.value.label = contact.email;

    const contactMfa = await client.contact.mfa.get(contactId);
    if (contactMfa && contactMfa.type === CONTACT_MFA_TYPE.TOTP) {
      isEnabled.value = true;
    }
  },
  { immediate: true }
);

/** Watch TOTP identity changes */
watch(totpIdentity, onTotpIdentityChanged, { deep: true });

/** Hide the invalid-code error as soon as the user edits the token again */
watch(disableToken, () => {
  disableError.value = false;
  disableUnknownError.value = false;
});

/** Hide the invalid-code error as soon as the user edits the pin again */
watch(pin, () => {
  createError.value = false;
  createUnknownError.value = false;
});
</script>
