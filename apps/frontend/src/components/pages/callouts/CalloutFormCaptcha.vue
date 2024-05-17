<template>
  <div class="mb-8">
    <h3 class="mb-2 font-title text-xl font-semibold">
      {{ t('callout.confirmHuman') }}
    </h3>
    <CaptchaFox
      :sitekey="env.captchafoxKey"
      :model-value="modelValue"
      :lang="currentLocaleConfig.baseLocale"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>
<script setup lang="ts">
import { CaptchaFox } from '@captchafox/vue';
import env from '@env';
import { currentLocaleConfig } from '@lib/i18n';

import { useI18n } from 'vue-i18n';

defineEmits(['update:modelValue']);
defineProps<{ modelValue: string }>();

const { t } = useI18n();
</script>
<style>
.cf-button {
  max-width: 100% !important;
}
</style>
