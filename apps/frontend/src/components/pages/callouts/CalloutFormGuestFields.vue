<template>
  <div class="mb-8">
    <h3 class="mb-2 font-title text-xl font-semibold">
      {{ t('callout.contactDetails') }}
    </h3>
    <p v-if="!env.cnrMode" class="mb-3 text-sm">
      {{ t('join.memberAlready') }}
      <router-link
        to="/auth/login"
        class="text-link underline hover:text-primary"
        >{{ t('join.login') }}</router-link
      >
    </p>
    <div class="mb-4">
      <AppInput
        v-model="firstname"
        :label="t('form.firstName')"
        name="firstName"
        required
      />
    </div>
    <div class="mb-4">
      <AppInput
        v-model="lastname"
        :label="t('form.lastName')"
        name="lastName"
        required
      />
    </div>
    <div>
      <AppInput
        v-model="email"
        :label="t('form.email')"
        type="email"
        name="email"
        required
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import AppInput from '../../forms/AppInput.vue';
import env from '../../../env';

const { t } = useI18n();

const firstname = defineModel<string>('firstname');
const lastname = defineModel<string>('lastname');
const email = defineModel<string>('email');
</script>
