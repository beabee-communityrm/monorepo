<route lang="yaml">
meta:
  layout: Auth
  pageTitle: pageTitle.notFound
</route>

<template>
  <AuthBox>
    <AppTitle big>
      {{ t('pageTitle.notFound') }}
    </AppTitle>

    <i18n-t keypath="notFound.text" class="mb-4 md:text-lg" tag="p">
      <template #support>
        <a
          class="text-link underline"
          :href="'mailto:' + generalContent.supportEmail"
        >
          {{ generalContent.supportEmail }}
        </a>
      </template>
    </i18n-t>

    <AppButton class="w-full" to="/">
      {{ t('notFound.goBack') }}
    </AppButton>
  </AuthBox>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import AppButton from '../components/button/AppButton.vue';
import { generalContent } from '../store';
import AppTitle from '../components/AppTitle.vue';
import AuthBox from '../components/AuthBox.vue';

const { t } = useI18n();
</script>
