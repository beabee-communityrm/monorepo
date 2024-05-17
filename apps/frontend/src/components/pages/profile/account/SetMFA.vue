<!--
  # SetMFA
  This component is used to set up MFA for a contact.
  It uses a slider to guide the user through the process.

  ## Props
  - `contactId` (string): The id of the contact to set up MFA for.

  ## Possible improvements
  - Add support for other MFA types (e.g. SMS)
  - Transform this component into a general useable wizard component

-->

<template>
  <AppHeading class="mt-6">
    {{ t('accountPage.mfa.title') }}
  </AppHeading>

  <AppButton
    v-if="isEnabled"
    variant="primaryOutlined"
    :icon="faMobileAlt"
    @click="showDisableConfirmModal = true"
  >
    {{ t(`actions.disable`) }}
  </AppButton>

  <AppButton
    v-else
    variant="primaryOutlined"
    :icon="faMobileAlt"
    @click="showMFASettingsModal = !showMFASettingsModal"
  >
    {{ t(`actions.enable`) }}
  </AppButton>

  <AppConfirmDialog
    :open="showDisableConfirmModal"
    :title="t('accountPage.mfa.confirmDelete.title')"
    :cancel="t('actions.noBack')"
    :confirm="t('actions.yesDisable')"
    :disable-confirm="!userTokenInputValid"
    variant="danger"
    @close="closeDisableConfirmModal"
    @confirm="disableMfaAndNotify"
  >
    <p class="mb-3">{{ t('accountPage.mfa.confirmDelete.desc') }}</p>
    <p class="mb-5">{{ t('accountPage.mfa.confirmDelete.descToken') }}</p>
    <AppInput
      v-model="userToken"
      type="text"
      :label="t(`accountPage.mfa.codeInput.label`)"
      name="verifyCode"
      required
      min="6"
      max="6"
      @keyup.enter="disableMfaAndNotify()"
      @update:validation="onUserTokenInputValidationChanged"
    />

    <AppNotification
      v-if="disableMfaValidated && !userTokenValid"
      class="my-4"
      variant="error"
      :title="t('accountPage.mfa.result.invalidCode')"
    />
  </AppConfirmDialog>

  <AppModal
    :open="showMFASettingsModal"
    :title="t(`accountPage.mfa.modalTitle`)"
    class="w-full"
    @close="onCloseMFAModal"
  >
    <AppSlider ref="appSliderCo" :steps="stepsInOrder" @slide="onSlideChange">
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
              <AppInput
                readonly
                type="text"
                :value="totpSecret.base32"
                :label="t(`accountPage.mfa.secretInput.label`)"
              ></AppInput>
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
              <AppInput
                v-model="userToken"
                type="text"
                :label="t(`accountPage.mfa.codeInput.label`)"
                name="verifyCode"
                required
                min="6"
                max="6"
                @keyup.enter="nextSlideIfValid()"
                @update:validation="onUserTokenInputValidationChanged"
              />

              <AppNotification
                :class="{
                  'opacity-1': steps.enterCode.error,
                  'opacity-0': !steps.enterCode.error,
                }"
                class="my-4"
                variant="error"
                :title="t('accountPage.mfa.result.invalidCode')"
              />
            </span>
          </div>
        </AppSlide>
        <!-- Last result slide with save button -->
        <AppSlide>
          <div
            class="flex h-full items-center justify-center whitespace-break-spaces text-center"
          >
            <span class="flex h-full w-full flex-col justify-center px-4">
              <AppNotification
                v-if="userTokenValid"
                class="my-4"
                variant="success"
                :title="t('accountPage.mfa.result.successful')"
              />
              <AppNotification
                v-else
                class="my-4"
                variant="error"
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
            <AppButton
              v-if="isFirstSlide"
              variant="linkOutlined"
              @click="closeMFAModal()"
            >
              {{ t(`actions.close`) }}
            </AppButton>
            <AppButton v-else variant="linkOutlined" @click="prevSlide()">
              {{ t(`actions.back`) }}
            </AppButton>
          </section>

          <!-- Next button variants -->
          <section>
            <!-- Last save button -->
            <AppButton
              v-if="isLastSlide"
              ref="saveButton"
              :disabled="!validationStepsDone"
              variant="link"
              @click="createMfaAndNotify()"
            >
              {{ t(`actions.save`) }}
            </AppButton>

            <!-- Verify token next button -->
            <AppButton
              v-else-if="
                activeSlide === 1 &&
                (!steps.enterCode.validated || steps.enterCode.error)
              "
              :disabled="!userTokenInputValid"
              variant="link"
              @click="nextSlideIfValid()"
            >
              {{ t(`accountPage.mfa.validateButton.label`) }}
            </AppButton>

            <!-- Default next button -->
            <AppButton v-else variant="link" @click="nextSlide()">
              {{ t(`actions.next`) }}
            </AppButton>
          </section>
        </span>
      </template>
    </AppSlider>
  </AppModal>
</template>

<script lang="ts" setup>
import {
  onBeforeMount,
  ref,
  toRef,
  computed,
  watch,
  reactive,
  nextTick,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { faMobileAlt } from '@fortawesome/free-solid-svg-icons';
import { TOTP, Secret } from 'otpauth';

import { fetchContact } from '@utils/api/contact';
import {
  createContactMfa,
  fetchContactMfa,
  deleteContactMfa,
} from '@utils/api/contact-mfa';
import { CONTACT_MFA_TYPE } from '@enums/contact-mfa-type';
import { isRequestError } from '@utils/api/index';
import { LOGIN_CODES } from '@enums/login-codes';

import AppButton from '@components/button/AppButton.vue';
import AppModal from '@components/AppModal.vue';
import AppHeading from '@components/AppHeading.vue';
import AppSlider from '@components/slider/AppSlider.vue';
import AppSlide from '@components/slider/AppSlide.vue';
import AppQRCode from '@components/AppQRCode.vue';
import AppInput from '@components/forms/AppInput.vue';
import AppConfirmDialog from '@components/AppConfirmDialog.vue';
import AppNotification from '@components/AppNotification.vue';

import { addNotification } from '@store/notifications';
import { generalContent } from '@store/index';

import type { AppStepperStep } from '@type/app-stepper-step';
import type { AppSliderSlideEventDetails } from '@type/app-slider-slide-event-details';
import type { SetMfaSteps } from '@type/set-mfa-steps';
import type { SetMfaTotpIdentity } from '@type/set-mfa-totp-identity';

const { t } = useI18n();

/** Reference to slider component */
const appSliderCo = ref<InstanceType<typeof AppSlider> | null>(null);

/** Used to show/hide the modal */
const showMFASettingsModal = ref(false);

const showDisableConfirmModal = ref(false);

/** Reference to the save button */
const saveButton = ref<typeof AppButton | null>(null);

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

/** TOTP instance */
let totp: TOTP | null = null;

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
    await createContactMfa(props.contactId, {
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
    await deleteContactMfa(props.contactId, {
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

/** Called when an error occurs while creating MFA */
const onCreateError = (error: unknown) => {
  if (
    isRequestError(error, undefined, [401]) &&
    error.response.data.code === LOGIN_CODES.INVALID_TOKEN
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
    isRequestError(
      error,
      [LOGIN_CODES.INVALID_TOKEN, LOGIN_CODES.MISSING_TOKEN],
      [400, 401]
    )
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

  // Focus the save button on the last slide, to allow the user to save with enter
  if (details.slideNumber === stepsInOrder.value.length - 1) {
    nextTick(() => {
      if (saveButton.value) {
        saveButton.value.focus();
      }
    });
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
 * Called when the user token input validation changes. This is not the same as the token validation, this is just the validation of the input.
 * @param isValid Is the input valid?
 */
const onUserTokenInputValidationChanged = (isValid: boolean) => {
  userTokenInputValid.value = isValid;
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
    const contact = await fetchContact(contactId, ['profile']);
    totpIdentity.value.issuer =
      generalContent.value.organisationName || 'beabee';
    totpIdentity.value.label = contact.email;

    const contactMfa = await fetchContactMfa(contactId);
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
