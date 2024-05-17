<template>
  <CalloutSidePanel :show="show" @close="$emit('close')">
    <div class="flex h-full flex-col items-start lg:justify-center">
      <AppTitle class="pt-8">{{ callout.title }}</AppTitle>
      <figure class="mb-6">
        <img class="w-full object-cover" :src="callout.image" />
      </figure>
      <div class="mb-6 text-lg" v-html="callout.intro"></div>
      <AppButton variant="primary" class="px-6" @click="$emit('close')">
        {{ t('actions.getStarted') }}
      </AppButton>
    </div>
  </CalloutSidePanel>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import CalloutSidePanel from './CalloutSidePanel.vue';
import AppTitle from '@components/AppTitle.vue';
import AppButton from '@components/button/AppButton.vue';

import type { GetCalloutDataWith } from '@type';

defineEmits<{ (e: 'close'): void }>();
defineProps<{ callout: GetCalloutDataWith<'form'>; show: boolean }>();

const { t } = useI18n();
</script>
