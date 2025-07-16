<template>
  <AppHeading>
    {{ t('accountPage.loginDetail') }}
  </AppHeading>

  <AppButton
    v-if="!showForm"
    variant="primaryOutlined"
    :icon="faKey"
    @click="
      showForm = true;
      saved = false;
    "
  >
    {{ t('actions.changePassword') }}
  </AppButton>

  <AppForm
    v-else
    :success-text="t('accountPage.savedPassword')"
    :button-text="t('actions.changePassword')"
    :reset-button-text="t('form.cancel')"
    :extract-error-code="extractApiErrorCode"
    @submit="handleFormSubmit"
    @reset="showForm = false"
  >
    <div class="mb-4">
      <AppInput
        v-model="password"
        type="password"
        name="password"
        autocomplete="new-password"
        required
        :label="t('form.newPassword')"
        :info-message="t('form.passwordInfo')"
      />
    </div>
    <div class="mb-4">
      <AppInput
        v-model="confirmPassword"
        type="password"
        name="confirmPassword"
        autocomplete="new-password"
        required
        :same-as="password"
        :label="t('form.newPasswordConfirm')"
      />
    </div>
  </AppForm>
</template>
<script lang="ts" setup>
import { AppButton, AppForm, AppHeading, AppInput } from '@beabee/vue';

import { faKey } from '@fortawesome/free-solid-svg-icons';
import { client } from '@utils/api';
import { extractApiErrorCode } from '@utils/api-error';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const showForm = ref(false);
const saved = ref(false);
const password = ref('');
const confirmPassword = ref('');

async function handleFormSubmit() {
  await client.contact.update('me', { password: password.value });
  saved.value = true;
  showForm.value = false;
}

onBeforeMount(() => {
  saved.value = false;
  showForm.value = false;
  password.value = '';
  confirmPassword.value = '';
});
</script>
