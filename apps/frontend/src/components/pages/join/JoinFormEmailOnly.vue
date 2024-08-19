<template>
  <AppForm :button-text="t('join.now')" full-button @submit="handleEmailSignup">
    <div class="mb-4">
      <AppInput
        v-model="email"
        :label="t('form.email')"
        type="email"
        name="email"
        required
      />

      <p class="mt-2 text-sm">
        {{ t('join.memberAlready') }}
        <a
          v-if="isEmbed"
          href="/auth/login"
          target="_blank"
          class="text-link underline hover:text-primary"
        >
          {{ t('join.login') }}
        </a>
        <router-link
          v-else
          to="/auth/login"
          class="text-link underline hover:text-primary"
        >
          {{ t('join.login') }}
        </router-link>
      </p>
    </div>
  </AppForm>
</template>
<script lang="ts" setup>
import AppForm from '@components/forms/AppForm.vue';
import AppInput from '@components/forms/AppInput.vue';
import { isEmbed } from '@store/index';
import { signUpWithEmailOnly } from '@utils/api/signup';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const email = ref('');

async function handleEmailSignup() {
  await signUpWithEmailOnly(email.value);

  if (isEmbed) {
    window.top!.location.href = '/join/confirm-email';
  } else {
    router.push({ path: '/join/confirm-email' });
  }
}
</script>
