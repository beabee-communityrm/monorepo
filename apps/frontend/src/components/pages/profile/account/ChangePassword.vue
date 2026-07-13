<template>
  <UForm ref="formRef" :schema="schema" :state="state" @submit="handleSubmit">
    <AppSectionCard icon="i-lucide-lock" :title="t('accountPage.loginDetail')">
      <UFormField :label="t('form.newPassword')" required name="password">
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
          type="button"
          variant="outline"
          color="neutral"
          @mousedown.prevent
          @click="handleCancel"
        >
          {{ t('actions.cancel') }}
        </UButton>
        <UButton
          type="submit"
          :loading="saving"
          :icon="saved ? 'i-lucide-check' : undefined"
        >
          {{
            saved ? t('accountPage.savedPassword') : t('actions.changePassword')
          }}
        </UButton>
      </div>
    </AppSectionCard>
  </UForm>
</template>
<script lang="ts" setup>
import { AppSectionCard, addNotification } from '@beabee/vue';

import * as v from 'valibot';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { extractErrorText } from '#utils/api-error';
import { client } from '#utils/api';

const { t } = useI18n();

const password = ref('');
const confirmPassword = ref('');
const state = reactive({ password, confirmPassword });
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

// UForm validates in response to DOM events (input/blur/change), not
// reactively off `:state` — a silent ref assignment (in handleCancel below)
// doesn't fire those events, so an already-shown error would otherwise stay
// stuck on screen. `formRef.value.clear()` explicitly wipes it.
// `setErrors` is used directly by handleSubmit below — see the comment on
// the "required" schema omission for why.
const formRef = ref<{
  clear: () => void;
  setErrors: (errs: { name: string; message: string }[]) => void;
} | null>(null);

// Deliberately no `v.nonEmpty(...)` "required" check here (unlike the other
// fields on this page): Nuxt UI's `UFormField` has a quirk where passing
// `:error="false"` to force-suppress a message still leaves the red border
// showing (its internal `error` computed is `props.error || matchedError`,
// and `false` is falsy so the `||` falls through). That made an empty
// password/confirmPassword field turn red on a bare focus+blur, before the
// user had even attempted to save. Since blur validates against this schema
// directly, the only way to stop that is to not flag "empty" as invalid in
// the schema at all — required-ness is instead checked manually in
// handleSubmit below, only at actual submit time.
const schema = computed(() =>
  v.pipe(
    v.object({
      password: v.pipe(
        v.string(),
        v.check(isValidPassword, t('form.errors.password.password'))
      ),
      confirmPassword: v.string(),
    }),
    v.forward(
      v.partialCheck(
        [['password'], ['confirmPassword']],
        // Skip the mismatch check while confirmPassword is still empty —
        // same reasoning as above, don't nag about a field the user hasn't
        // gotten to yet.
        (input) =>
          !input.confirmPassword || input.password === input.confirmPassword,
        t('form.errors.confirmPassword.sameAs')
      ),
      ['confirmPassword']
    )
  )
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

  saving.value = true;
  try {
    await client.contact.update('me', { password: password.value });
    saved.value = true;
    password.value = '';
    confirmPassword.value = '';
    formRef.value?.clear();
    addNotification({
      title: t('accountPage.savedPassword'),
      variant: 'success',
    });
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
  formRef.value?.clear();
}
</script>
