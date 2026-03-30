<template>
  <div>
    <div class="mb-4">
      <AppInput
        v-model="emailUser"
        :label="t('adminSettings.email.fromEmail')"
        :disabled="disabled"
        required
      >
        <template #after>
          <span class="font-semibold">{{ emailDomain }}</span>
        </template>
      </AppInput>
    </div>
    <AppInput
      v-model="name"
      :label="t('adminSettings.email.fromName')"
      :disabled="disabled"
      required
    />
  </div>
</template>
<script lang="ts" setup>
import { AppInput } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { generalContent } from '#store';

const { t } = useI18n();

const email = defineModel<string>('email', { required: true });
const name = defineModel<string>('name', { required: true });

defineProps<{
  disabled?: boolean;
}>();

const emailUser = computed({
  get: () => {
    const i = email.value.lastIndexOf('@');
    return email.value.slice(0, i);
  },
  set: (newName) => {
    email.value = newName + emailDomain.value;
  },
});

const emailDomain = computed(() => {
  const i = generalContent.value.supportEmail.lastIndexOf('@');
  return generalContent.value.supportEmail.slice(i);
});
</script>
