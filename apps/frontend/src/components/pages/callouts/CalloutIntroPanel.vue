<template>
  <CalloutSidePanel :show="show" @close="$emit('close')">
    <div class="flex h-full flex-col items-start lg:justify-center">
      <AppTitle class="pt-8">{{ callout.title }}</AppTitle>

      <div v-if="callout.status === ItemStatus.Open" class="mb-6">
        <AppShareBox :url="`${env.appUrl}/${route.path}`" />
      </div>

      <img class="mb-6 w-full" :src="imageUrl" />
      <div class="content-message mb-6 text-lg" v-html="callout.intro" />

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
import { type GetCalloutDataWith, ItemStatus } from '@beabee/beabee-common';
import { AppButton, AppShareBox, AppTitle } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import noImage from '#assets/images/no-image.avif';
import env from '#env';
import { generalContent } from '#store/generalContent';
import { resolveImageUrl } from '#utils/url';

import CalloutSidePanel from './CalloutSidePanel.vue';

defineEmits<{ (e: 'close'): void }>();

const props = defineProps<{
  callout: GetCalloutDataWith<'form'>;
  show: boolean;
}>();

const route = useRoute();
const { t } = useI18n();

const imageUrl = computed(() => {
  return props.callout.image ? resolveImageUrl(props.callout.image) : noImage;
});
</script>
