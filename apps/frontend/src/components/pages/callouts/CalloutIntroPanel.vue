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
      <ul class="mt-8 w-full border-t border-primary-40 pt-4 text-sm">
        <li>
          <a :href="generalContent.privacyLink" class="text-link">{{
            t('footer.privacyPolicy')
          }}</a>
        </li>
        <li v-if="generalContent.termsLink">
          <a :href="generalContent.termsLink" class="text-link">{{
            t('footer.terms')
          }}</a>
        </li>
        <li v-if="generalContent.impressumLink">
          <a :href="generalContent.impressumLink" class="text-link">{{
            t('footer.impressum')
          }}</a>
        </li>
      </ul>
    </div>
  </CalloutSidePanel>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import CalloutSidePanel from './CalloutSidePanel.vue';
import AppTitle from '@components/AppTitle.vue';
import AppButton from '@components/button/AppButton.vue';
import { generalContent } from '@store/generalContent';
import type { GetCalloutDataWith } from '@beabee/beabee-common';

defineEmits<{ (e: 'close'): void }>();
defineProps<{ callout: GetCalloutDataWith<'form'>; show: boolean }>();

const { t } = useI18n();
</script>
