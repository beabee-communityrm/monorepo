<template>
  <div>
    <h3 class="mb-2 font-title text-xl font-semibold">
      {{ t('callout.contactDetails') }}
    </h3>
    <div class="mb-4">
      <AppInput
        v-model="firstname"
        :label="t('form.firstName')"
        name="firstName"
        :required="isRequired"
      />
    </div>
    <div class="mb-4">
      <AppInput
        v-model="lastname"
        :label="t('form.lastName')"
        name="lastName"
        :required="isRequired"
      />
    </div>
    <div>
      <AppInput
        v-model="email"
        :label="t('form.email')"
        type="email"
        name="email"
        :required="isRequired"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import AppInput from '../../forms/AppInput.vue';
import { computed } from 'vue';

const { t } = useI18n();

const props = defineProps<{ required?: boolean }>();

const firstname = defineModel<string>('firstname');
const lastname = defineModel<string>('lastname');
const email = defineModel<string>('email');

const isRequired = computed(
  () => !!(firstname.value || lastname.value || email.value || props.required)
);
</script>
