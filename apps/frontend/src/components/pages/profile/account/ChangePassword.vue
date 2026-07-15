<template>
  <UForm ref="formRef" :schema="schema" :state="state" @submit="handleSubmit">
    <AppSectionCard icon="i-lucide-lock" :title="t('accountPage.loginDetail')">
      <UFormField
        :label="t('form.newPassword')"
        required
        name="password"
        :help="t('form.passwordInfo')"
      >
        <UInput
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          class="w-full"
        >
          <template #trailing>
            <UButton
              type="button"
              variant="link"
              color="neutral"
              size="sm"
              :icon="showPassword ? 'i-lucide-eye' : 'i-lucide-eye-off'"
              :aria-label="
                showPassword
                  ? t('actions.hidePassword')
                  : t('actions.showPassword')
              "
              @click="toggleShowPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <UFormField
        :label="t('form.newPasswordConfirm')"
        required
        name="confirmPassword"
      >
        <UInput
          v-model="confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          autocomplete="new-password"
          class="w-full"
        >
          <template #trailing>
            <UButton
              type="button"
              variant="link"
              color="neutral"
              size="sm"
              :icon="showConfirmPassword ? 'i-lucide-eye' : 'i-lucide-eye-off'"
              :aria-label="
                showConfirmPassword
                  ? t('actions.hidePassword')
                  : t('actions.showPassword')
              "
              @click="toggleShowConfirmPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <div class="flex items-center gap-2">
        <UButton
          v-if="password || confirmPassword"
          type="button"
          variant="outline"
          color="neutral"
          @mousedown.prevent
          @click="handleCancel"
        >
          {{ t('actions.cancel') }}
        </UButton>
        <UButton type="submit" loading-auto>
          {{ t('actions.changePassword') }}
        </UButton>
      </div>
    </AppSectionCard>
  </UForm>
</template>
<script lang="ts" setup>
import { isPassword } from '@beabee/beabee-common';
import { AppSectionCard } from '@beabee/vue';

import { computed, reactive, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

import { useApiSubmit } from '#composables/useApiSubmit';
import { client } from '#utils/api';

const { t } = useI18n();

const password = ref('');
const confirmPassword = ref('');
const state = reactive({ password, confirmPassword });
const showPassword = ref(false);
const showConfirmPassword = ref(false);

function toggleShowPassword() {
  showPassword.value = !showPassword.value;
}
function toggleShowConfirmPassword() {
  showConfirmPassword.value = !showConfirmPassword.value;
}

function isValidPassword(value: string): boolean {
  return !value || isPassword(value);
}

const formRef = useTemplateRef('formRef');

// Deliberately no `v.nonEmpty(...)` "required" check here. The fields are initially
// empty so validating "required" the moment the user focuses and blurs the field
//  — even if they haven't typed anything at all — means showing an error for a
//  field/form they are choosing not to fill out. Required-ness is instead checked
//  manually in handleSubmit below, only at actual submit time.
const schema = computed(() =>
  z
    .object({
      password: z
        .string()
        .refine(isValidPassword, { error: t('form.errors.password.password') }),
      confirmPassword: z.string(),
    })
    .refine(
      (input) =>
        !input.confirmPassword || input.password === input.confirmPassword,
      {
        error: t('form.errors.confirmPassword.sameAs'),
        path: ['confirmPassword'],
      }
    )
);

const { submit: doSubmit } = useApiSubmit(
  async () => {
    await client.contact.update('me', { password: password.value });
    password.value = '';
    confirmPassword.value = '';
    formRef.value?.clear();
  },
  { successMessage: () => t('accountPage.savedPassword') }
);

async function handleSubmit() {
  if (!password.value || !confirmPassword.value) {
    formRef.value?.setErrors([
      ...(!password.value
        ? [{ name: 'password', message: t('form.errors.password.required') }]
        : []),
      ...(!confirmPassword.value
        ? [
            {
              name: 'confirmPassword',
              message: t('form.errors.confirmPassword.required'),
            },
          ]
        : []),
    ]);
    return;
  }

  await doSubmit();
}

function handleCancel() {
  password.value = '';
  confirmPassword.value = '';
  formRef.value?.clear();
}
</script>
