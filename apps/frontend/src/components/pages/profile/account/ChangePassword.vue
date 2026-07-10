<template>
  <AppSectionCard icon="i-lucide-lock" :title="t('accountPage.loginDetail')">
    <UFormField
      :label="t('form.newPassword')"
      required
      :error="errorFor('password')"
    >
      <UInput
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="new-password"
        class="w-full"
        @blur="v$.password.$touch"
        @update:model-value="v$.password.$reset()"
      >
        <template #trailing>
          <UButton
            variant="link"
            color="neutral"
            size="sm"
            :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            :aria-label="
              showPassword
                ? t('actions.hidePassword')
                : t('actions.showPassword')
            "
            @click="showPassword = !showPassword"
          />
        </template>
      </UInput>

      <p class="text-muted mt-1.5 flex items-center gap-1 text-xs">
        <UIcon name="i-lucide-info" class="size-3 shrink-0" />
        {{ t('form.passwordInfo') }}
      </p>
    </UFormField>

    <UFormField
      :label="t('form.newPasswordConfirm')"
      required
      :error="errorFor('confirmPassword')"
    >
      <UInput
        v-model="confirmPassword"
        :type="showConfirmPassword ? 'text' : 'password'"
        autocomplete="new-password"
        class="w-full"
        @blur="v$.confirmPassword.$touch"
        @update:model-value="v$.confirmPassword.$reset()"
      >
        <template #trailing>
          <UButton
            variant="link"
            color="neutral"
            size="sm"
            :icon="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            :aria-label="
              showConfirmPassword
                ? t('actions.hidePassword')
                : t('actions.showPassword')
            "
            @click="showConfirmPassword = !showConfirmPassword"
          />
        </template>
      </UInput>
    </UFormField>

    <div class="flex items-center gap-2">
      <UButton
        v-if="password || confirmPassword"
        variant="outline"
        color="neutral"
        @mousedown.prevent
        @click="handleCancel"
      >
        {{ t('actions.cancel') }}
      </UButton>
      <UButton
        :loading="saving"
        :icon="saved ? 'i-lucide-check' : undefined"
        @click="handleSubmit"
      >
        {{
          saved ? t('accountPage.savedPassword') : t('actions.changePassword')
        }}
      </UButton>
    </div>
  </AppSectionCard>
</template>
<script lang="ts" setup>
import { AppSectionCard, addNotification } from '@beabee/vue';

import useVuelidate from '@vuelidate/core';
import {
  helpers,
  required,
  sameAs as sameAsValidator,
} from '@vuelidate/validators';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { extractErrorText } from '#utils/api-error';
import { client } from '#utils/api';

const { t } = useI18n();

const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const saving = ref(false);
const saved = ref(false);

function isValidPassword(value: string): boolean {
  if (!value) return true;
  return (
    value.length >= 8 &&
    /[0-9]/.test(value) &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value)
  );
}

const rules = computed(() => ({
  password: {
    required: helpers.withMessage(t('form.errors.password.required'), required),
    password: helpers.withMessage(
      t('form.errors.password.password'),
      isValidPassword
    ),
  },
  confirmPassword: {
    required: helpers.withMessage(
      t('form.errors.confirmPassword.required'),
      required
    ),
    sameAs: helpers.withMessage(
      t('form.errors.confirmPassword.sameAs'),
      sameAsValidator(password)
    ),
  },
}));

const v$ = useVuelidate(rules, reactive({ password, confirmPassword }));

/**
 * Whether a save attempt has been made. Until then, an empty password/
 * confirmPassword field doesn't show a "required" error on blur — these
 * fields are always empty to start with, so validating that immediately
 * just punishes the user for a field they haven't gotten to yet. Once a
 * save is attempted, required errors show like any other.
 */
const hasSubmitted = ref(false);

function errorFor(field: 'password' | 'confirmPassword'): string | undefined {
  const value = field === 'password' ? password.value : confirmPassword.value;
  if (!value && !hasSubmitted.value) return undefined;
  return v$.value[field]?.$errors[0]?.$message as string | undefined;
}

async function handleSubmit() {
  hasSubmitted.value = true;
  v$.value.$touch();
  if (v$.value.$invalid) return;

  saving.value = true;
  try {
    await client.contact.update('me', { password: password.value });
    saved.value = true;
    password.value = '';
    confirmPassword.value = '';
    v$.value.$reset();
    hasSubmitted.value = false;
    setTimeout(() => {
      saved.value = false;
    }, 3000);
  } catch (err) {
    addNotification({ title: extractErrorText(err), variant: 'error' });
  } finally {
    saving.value = false;
  }
}

function handleCancel() {
  password.value = '';
  confirmPassword.value = '';
  v$.value.$reset();
  hasSubmitted.value = false;
}
</script>
