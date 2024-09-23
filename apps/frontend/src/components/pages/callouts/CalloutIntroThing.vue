<template>
  <div v-if="isOpen" class="flex items-center justify-between">
    <div class="flex items-center text-sm font-semibold text-body-60">
      <ItemStatusText :item="callout" circle />
    </div>
    <AppButton
      :icon="showSharingPanel ? faCaretDown : faShare"
      variant="primaryOutlined"
      @click="showSharingPanel = !showSharingPanel"
    >
      {{ t('actions.share') }}
    </AppButton>
  </div>

  <transition name="slide">
    <SharingPanel v-if="showSharingPanel" :slug="callout.slug" />
  </transition>

  <img class="w-full" :src="callout.image" />

  <div class="content-message text-lg" v-html="callout.intro" />
</template>
<script setup lang="ts">
import type { GetCalloutDataWith } from '@beabee/beabee-common';
import { faCaretDown, faShare } from '@fortawesome/free-solid-svg-icons';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps<{
  callout: GetCalloutDataWith<'form'>;
}>();

const { t } = useI18n();

const showSharingPanel = ref(false);
</script>

<style scoped>
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  height: 0;
  padding: 0;
  margin: 0;
  overflow: hidden;
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease-out;
}
.slide-enter-to,
.slide-leave-from {
  max-height: 16rem;
  height: auto;
}
</style>
