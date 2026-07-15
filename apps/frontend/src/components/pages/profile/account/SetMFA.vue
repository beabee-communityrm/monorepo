<!--
  # SetMFA
  This component is used to set up MFA for a contact.
  It uses a slider to guide the user through the process.

  Keyboard navigation is disabled for the slider because this is a complex
  multi-step form where navigation should be controlled by the validation
  logic and custom navigation buttons.

  ## Props
  - `contactId` (string): The id of the contact to set up MFA for.

  ## Possible improvements
  - Add support for other MFA types (e.g. SMS)
  - Transform this component into a general useable wizard component

-->

<template>
  <AppSectionCard
    icon="i-lucide-shield-check"
    :title="t('accountPage.mfa.title')"
    :description="t('accountPage.mfa.description')"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <p class="text-sm font-medium">
          {{
            isEnabled
              ? t('accountPage.mfa.statusEnabled.title')
              : t('accountPage.mfa.statusDisabled.title')
          }}
        </p>
        <p class="text-muted text-xs">
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
    :title="t('accountPage.mfa.confirmDelete.title')"
    @update:open="(open: boolean) => !open && closeDisableConfirmModal()"
  >
    <template #body>
      <p class="text-muted mb-3 text-sm">
        {{ t('accountPage.mfa.confirmDelete.desc') }}
      </p>
      <p class="text-muted mb-5 text-sm">
        {{ t('accountPage.mfa.confirmDelete.descToken') }}
      </p>

      <UFormField :label="t('accountPage.mfa.codeInput.label')" required>
        <UInput
          v-model="userToken"
          class="w-full"
          maxlength="6"
          @keyup.enter="disableMfaAndNotify()"
          @update:model-value="onUserTokenInputChanged"
        />
      </UFormField>

      <UAlert
        v-if="disableMfaValidated && !userTokenValid"
        class="mt-4"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        :title="t('accountPage.mfa.result.invalidCode')"
      />
    </template>

    <template #footer>
      <UButton
        variant="outline"
        color="neutral"
        @click="closeDisableConfirmModal"
      >
        {{ t('actions.noBack') }}
      </UButton>
      <UButton
        color="error"
        :disabled="!userTokenInputValid"
        :loading="disabling"
        @click="handleDisableClick"
      >
        {{ t('actions.yesDisable') }}
      </UButton>
    </template>
  </UModal>

  <UModal
    :open="showMFASettingsModal"
    :title="t('accountPage.mfa.modalTitle')"
    @update:open="(open: boolean) => !open && onCloseMFAModal()"
  >
    <template #body>
      <AppSlider
        ref="appSliderCo"
        :steps="stepsInOrder"
        disable-keyboard-navigation
        @slide="onSlideChange"
      >
        <template #slides>
          <!-- QR code and secret slide -->
          <AppSlide>
            <div class="whitespace-break-spaces">
              <p class="text-center">
                {{ t(`accountPage.mfa.scan.desc`) }}
              </p>
              <AppQRCode v-if="totpUrl" :qr-data="totpUrl" />
              <p class="text-center">
                {{ t(`accountPage.mfa.secretInput.desc`) }}
              </p>
              <div class="p-4">
                <UFormField :label="t(`accountPage.mfa.secretInput.label`)">
                  <UInput
                    :model-value="totpSecret.base32"
                    readonly
                    class="w-full"
                  />
                </UFormField>
              </div>
            </div>
          </AppSlide>
          <!-- User token verification slide -->
          <AppSlide>
            <div
              class="flex h-full flex-col items-center justify-between whitespace-break-spaces"
            >
              <p class="text-center">
                {{ t(`accountPage.mfa.enterCode.desc`) }}
              </p>
              <span class="flex h-full w-full flex-col justify-center px-4">
                <UFormField :label="t(`accountPage.mfa.codeInput.label`)">
                  <UInput
                    v-model="userToken"
                    class="w-full"
                    maxlength="6"
                    @keyup.enter="nextSlideIfValid()"
                    @update:model-value="onUserTokenInputChanged"
                  />
                </UFormField>

                <UAlert
                  v-if="steps.enterCode.error"
                  class="my-4"
                  color="error"
                  variant="soft"
                  icon="i-lucide-circle-alert"
                  :title="t('accountPage.mfa.result.invalidCode')"
                />
              </span>
            </div>
          </AppSlide>
          <!-- Last result slide with save button -->
          <AppSlide>
            <div
              class="flex h-full items-center justify-center text-center whitespace-break-spaces"
            >
              <span class="flex h-full w-full flex-col justify-center px-4">
                <UAlert
                  v-if="userTokenValid"
                  class="my-4"
                  color="success"
                  variant="soft"
                  icon="i-lucide-check"
                  :title="t('accountPage.mfa.result.successful')"
                />
                <UAlert
                  v-else
                  class="my-4"
                  color="error"
                  variant="soft"
                  icon="i-lucide-circle-alert"
                  :title="t('accountPage.mfa.result.invalidCode')"
                />
              </span>
            </div>
          </AppSlide>
        </template>

        <template
          #navigation="{
            nextSlide,
            prevSlide,
            isFirstSlide,
            isLastSlide,
            activeSlide,
          }"
        >
          <span class="mt-3 flex justify-between">
            <!-- Back buttons -->
            <section>
              <UButton
                v-if="isFirstSlide"
                variant="outline"
                color="neutral"
                @click="closeMFAModal()"
              >
                {{ t(`actions.close`) }}
              </UButton>
              <UButton
                v-else
                variant="outline"
                color="neutral"
                @click="prevSlide()"
              >
                {{ t(`actions.back`) }}
              </UButton>
            </section>

            <!-- Next button variants -->
            <section>
              <!-- Last save button -->
              <UButton
                v-if="isLastSlide"
                :disabled="!validationStepsDone"
                @click="createMfaAndNotify()"
              >
                {{ t(`actions.save`) }}
              </UButton>

              <!-- Verify token next button -->
              <UButton
                v-else-if="
                  activeSlide === 1 &&
                  (!steps.enterCode.validated || steps.enterCode.error)
                "
                :disabled="!userTokenInputValid"
                @click="nextSlideIfValid()"
              >
                {{ t(`accountPage.mfa.validateButton.label`) }}
              </UButton>

              <!-- Default next button -->
              <UButton v-else @click="nextSlide()">
                {{ t(`actions.next`) }}
              </UButton>
            </section>
          </span>
        </template>
      </AppSlider>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import {
  CONTACT_MFA_TYPE,
  GetContactWith,
  LOGIN_CODES,
} from '@beabee/beabee-common';
import { UnauthorizedError } from '@beabee/client';
import type { AppSliderSlideEventDetails, AppStepperStep } from '@beabee/vue';
import {
  AppQRCode,
  AppSectionCard,
  AppSlide,
  AppSlider,
  addNotification,
} from '@beabee/vue';

import { Secret, TOTP } from 'otpauth';
import { computed, onBeforeMount, reactive, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { generalContent } from '#store/index';
import type { SetMfaSteps } from '#type/set-mfa-steps';
import type { SetMfaTotpIdentity } from '#type/set-mfa-totp-identity';
import { client } from '#utils/api';

const { t } = useI18n();

/** Reference to slider component */
const appSliderCo = ref<InstanceType<typeof AppSlider> | null>(null);

/** Used to show/hide the modal */
const showMFASettingsModal = ref(false);

const showDisableConfirmModal = ref(false);

/** Is multi factor authentication enabled? */
const isEnabled = ref(false);

/** Stepper steps */
const steps = reactive<SetMfaSteps>({
  qrCode: {
    name: t(`accountPage.mfa.scan.title`),
    validated: false,
    error: false,
  },
  enterCode: {
    name: t(`accountPage.mfa.enterCode.title`),
    validated: false,
    error: false,
  },
  result: {
    name: t(`accountPage.mfa.result.title`),
    validated: false,
    error: false,
  },
});

/** Stepper steps as array */
const stepsInOrder = ref<AppStepperStep[]>([
  steps.qrCode,
  steps.enterCode,
  steps.result,
]);

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

/** User token used to verify totp  */
const userToken = ref('');

/** Is the user token valid? */
const userTokenValid = ref(false);

/** Is the user token input valid? */
const userTokenInputValid = ref(false);

const disableMfaValidated = ref(false);

/** Loading state while confirming the disable-2FA dialog */
const disabling = ref(false);

/** TOTP instance */
let totp: TOTP | null = null;

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
  // If the user closes the modal on the last slide, save the MFA anyway
  if (
    appSliderCo.value &&
    appSliderCo.value.activeSlide === appSliderCo.value.slideCount - 1
  ) {
    return createMfaAndNotify();
  }

  closeMFAModal();
  resetState();
};

/** Called when the disable confirm modal is closed */
const closeDisableConfirmModal = () => {
  showDisableConfirmModal.value = false;
  resetState();
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
      token: userToken.value,
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
  disableMfaValidated.value = true;
  try {
    await client.contact.mfa.delete(props.contactId, {
      type: CONTACT_MFA_TYPE.TOTP,
      token: userToken.value,
    });
  } catch (error) {
    onDeleteError(error);
    return false;
  }
  isEnabled.value = false;
  disableMfaValidated.value = false;
  resetState();
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
  resetState();
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

/** Called when the disable confirm button is clicked (adds a loading state) */
const handleDisableClick = async () => {
  disabling.value = true;
  await disableMfaAndNotify();
  disabling.value = false;
};

/** Called when an error occurs while creating MFA */
const onCreateError = (error: unknown) => {
  if (
    error instanceof UnauthorizedError &&
    error.code === LOGIN_CODES.INVALID_TOKEN
  ) {
    // If server says the token is invalid, set the token as invalid and go to the previous slide
    setValidationStates(false);
    appSliderCo.value?.prevSlide();
    return;
  }

  // Start from the beginning on an unknown error
  resetState();
  addNotification({
    title: t('accountPage.mfa.createUnknownErrorNotification'),
    variant: 'error',
  });
};

const onDeleteError = (error: unknown) => {
  if (
    error instanceof UnauthorizedError &&
    (error.code === LOGIN_CODES.INVALID_TOKEN ||
      error.code === LOGIN_CODES.MISSING_TOKEN)
  ) {
    // If server says the token is invalid, set the token as invalid
    setValidationStates(false);
    return;
  }

  addNotification({
    title: t('accountPage.mfa.deleteUnknownErrorNotification'),
    variant: 'error',
  });
};

/** Called when the slider changes */
const onSlideChange = (details: AppSliderSlideEventDetails) => {
  // Reset state if the user goes back to the first slide
  if (details.slideNumber === 0) {
    resetState();
  }

  // Validate previous steps
  validatePreviousSteps(details.slideNumber);
};

/** Reset / init the state of the component */
const resetState = () => {
  appSliderCo.value?.toSlide(0);
  stepsInOrder.value.forEach((step) => {
    step.validated = false;
    step.error = false;
  });
  userToken.value = '';
  userTokenValid.value = false;
  userTokenInputValid.value = false;
};

/** Validate all previous steps */
const validatePreviousSteps = (slideNumber: number) => {
  if (!stepsInOrder.value) return;
  for (let i = 0; i < stepsInOrder.value.length; i++) {
    const step = stepsInOrder.value[i];
    step.validated = i < slideNumber;
  }
};

/** Called when the totp identity changes */
const onTotpIdentityChanged = (newValue: SetMfaTotpIdentity) => {
  totpSecret.value = new Secret();
  totp = new TOTP({
    issuer: newValue.issuer,
    label: newValue.label,
    secret: totpSecret.value,
  });
  totpUrl.value = totp.toString();
};

/**
 * Reset the user token validation state if the user token changes
 */
const onUserTokenChanged = () => {
  userTokenValid.value = false;
  steps.enterCode.error = false;
  steps.enterCode.validated = false;
};

/**
 * Called when the user token input changes. Validates the input format
 * (this is not the same as validating the token against the TOTP secret).
 * @param value The new input value
 */
const onUserTokenInputChanged = (value: string | number) => {
  userTokenInputValid.value = String(value).length === 6;
};

/** Validate the **T**imed **O**ne **T**ime **P**assword token / user input code */
const validateTotpToken = (window = 2) => {
  if (!totp) {
    throw new Error('totp is falsy!');
  }

  const delta = totp.validate({
    token: userToken.value,
    window,
  });

  userTokenValid.value = delta === 0;

  return userTokenValid.value;
};

/**
 * Set the validation state of the slides
 * @param isValid Is the token valid?
 */
const setValidationStates = (isValid: boolean) => {
  userTokenValid.value = isValid;

  steps.enterCode.error = !isValid;
  steps.enterCode.validated = isValid;

  if (isValid) {
    steps.result.error = !isValid;
    steps.result.validated = isValid;
  }

  return isValid;
};

/** Validate token and go to next slide if valid */
const nextSlideIfValid = () => {
  const isValid = setValidationStates(validateTotpToken());

  if (isValid) {
    appSliderCo.value?.nextSlide();
  }
};

/** Are all steps done with no errors? */
const validationStepsDone = computed(() => {
  return (
    steps.qrCode.validated &&
    !steps.qrCode.error &&
    steps.enterCode.validated &&
    !steps.enterCode.error
  );
});

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

watch(userToken, onUserTokenChanged);

onBeforeMount(() => {
  resetState();
});
</script>
