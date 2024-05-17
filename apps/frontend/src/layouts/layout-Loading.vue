<template>
  <main
    class="min-h-screen bg-cover bg-fixed bg-center py-4"
    :style="backgroundStyle"
  >
    <AuthBox class="text-center">
      <div class="flex h-full flex-col justify-center text-center">
        <AppTitle big>{{ t('common.loading') }}</AppTitle>

        <font-awesome-icon
          class="text-[60px] text-body-60"
          :icon="faCircleNotch"
          spin
        />

        <router-view />
      </div>
    </AuthBox>
  </main>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import AuthBox from '../components/AuthBox.vue';
import { backgroundStyle } from '../store';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import AppTitle from '../components/AppTitle.vue';

const { t } = useI18n();
</script>
