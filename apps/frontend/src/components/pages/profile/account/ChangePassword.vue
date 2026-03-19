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

  <AppApiForm
    v-else
    :success-text="t('accountPage.savedPassword')"
    :button-text="t('actions.changePassword')"
    :reset-button-text="t('form.cancel')"
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
  </AppApiForm>
</template>
<script lang="ts" setup>
import { AppButton, AppHeading, AppInput } from '@beabee/vue';

import { faKey } from '@fortawesome/free-solid-svg-icons';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppApiForm from '#components/forms/AppApiForm.vue';
import { client } from '#utils/api';

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
