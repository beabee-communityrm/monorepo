<template>
  <UFooter :ui="{ root: 'border-t border-default', left: 'text-sm', right: 'text-sm gap-x-6' }">
    <template #left>
      <AppLogo class="size-5 shrink-0 rounded-xs" />
      <span class="text-muted">
        <a :href="generalContent.siteUrl" class="font-semibold text-highlighted">{{
          generalContent.organisationName
        }}</a>
        · {{ t('footer.contactUs') }}
        <a :href="'mailto:' + generalContent.supportEmail" class="text-primary">{{
          generalContent.supportEmail
        }}</a>
      </span>
    </template>

    <template #right>
      <a
        v-if="generalContent.privacyLink"
        :href="generalContent.privacyLink"
        class="text-muted hover:text-default"
        >{{ t('footer.privacyPolicy') }}</a
      >
      <a
        v-if="generalContent.termsLink"
        :href="generalContent.termsLink"
        class="text-muted hover:text-default"
        >{{ t('footer.terms') }}</a
      >
      <a
        v-if="generalContent.impressumLink"
        :href="generalContent.impressumLink"
        class="text-muted hover:text-default"
        >{{ t('footer.impressum') }}</a
      >
      <a
        v-for="item in generalContent.footerLinks"
        :key="item.url"
        :href="item.url"
        class="text-muted hover:text-default"
        >{{ item.text }}</a
      >
      <a href="https://beabee.io" class="font-bold flex items-center gap-1 text-highlighted">
        beabee
        <UIcon name="i-lucide-external-link" class="size-3" />
      </a>
      <a v-if="canAdmin" href="https://beabee.io/#Newsletter" class="text-primary">
        {{ t('footer.joinCommunity') }}
      </a>
      <span v-else class="text-muted">{{ t('footer.poweredBy') }}</span>
    </template>
  </UFooter>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import AppLogo from './AppLogo.vue';
import { canAdmin, generalContent } from '../store';

const { t } = useI18n();
</script>
