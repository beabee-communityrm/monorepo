<template>
  <div class="mb-3">
    <AppInput
      v-model="emailProxy"
      :label="t('form.email')"
      name="email"
      type="email"
      required
    />
  </div>

  <div class="mb-3">
    <AppInput
      v-model="firstNameProxy"
      :label="t('form.firstName')"
      name="firstName"
      :required="!optionalNames"
    />
  </div>

  <div class="mb-3">
    <AppInput
      v-model="lastNameProxy"
      :label="t('form.lastName')"
      name="lastName"
      :required="!optionalNames"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppInput from '../forms/AppInput.vue';

const { t } = useI18n();

const emit = defineEmits([
  'update:email',
  'update:firstName',
  'update:lastName',
]);
const props = defineProps<{
  email: string;
  firstName: string;
  lastName: string;
  optionalNames?: boolean;
}>();

const emailProxy = computed({
  get: () => props.email,
  set: (email) => emit('update:email', email),
});

const firstNameProxy = computed({
  get: () => props.firstName,
  set: (firstName) => emit('update:firstName', firstName),
});

const lastNameProxy = computed({
  get: () => props.lastName,
  set: (lastName) => emit('update:lastName', lastName),
});
</script>
