<template>
  <CalloutSidePanel :show="show" @close="$emit('close')">
    <div class="flex h-full flex-col items-start lg:justify-center">
      <AppTitle class="pt-8">{{ t('callout.addLocation') }}</AppTitle>
      <AppButton
        variant="primaryOutlined"
        class="my-4 px-6"
        @click="$emit('selectmap')"
      >
        <font-awesome-icon :icon="faMap" />
        {{ t('callout.fromMap') }}
      </AppButton>
      <AppButton
        variant="primary"
        class="px-6"
        @click="$emit('selectmylocation')"
      >
        <font-awesome-icon :icon="faLocationCrosshairs" />
        {{ t('callout.fromMyLocation') }}
      </AppButton>
    </div>
  </CalloutSidePanel>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import CalloutSidePanel from './CalloutSidePanel.vue';
import AppTitle from '@components/AppTitle.vue';
import AppButton from '@components/button/AppButton.vue';
import { faMap, faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';

import type { GetCalloutDataWith } from '@type';

defineEmits<{
  (e: 'close'): void;
  (e: 'selectmap'): void;
  (e: 'selectsearch'): void;
  (e: 'selectmylocation'): void;
}>();
defineProps<{ callout: GetCalloutDataWith<'form'>; show: boolean }>();

const { t } = useI18n();
</script>
