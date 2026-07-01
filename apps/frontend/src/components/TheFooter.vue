<template>
  <footer class="border-default border-t p-4">
    <div class="flex items-center justify-between gap-6 text-sm">
      <!-- Left: org info -->
      <div class="flex items-center gap-3">
        <AppLogo class="h-8 w-auto" />
        <div>
          <a :href="generalContent.siteUrl" class="font-semibold">
            {{ generalContent.organisationName }}
          </a>
          <p class="text-muted">
            {{ t('footer.contactUs') }}
            <a
              :href="'mailto:' + generalContent.supportEmail"
              class="text-main"
            >
              {{ generalContent.supportEmail }}
            </a>
          </p>
        </div>
      </div>

      <!-- Center: legal links -->
      <div class="flex gap-6">
        <a
          v-if="generalContent.privacyLink"
          :href="generalContent.privacyLink"
          >{{ t('footer.privacyPolicy') }}</a
        >
        <a v-if="generalContent.termsLink" :href="generalContent.termsLink">{{
          t('footer.terms')
        }}</a>
        <a
          v-if="generalContent.impressumLink"
          :href="generalContent.impressumLink"
          >{{ t('footer.impressum') }}</a
        >
        <a
          v-for="item in generalContent.footerLinks"
          :key="item.url"
          :href="item.url"
          >{{ item.text }}</a
        >
      </div>

      <!-- Right: beabee -->
      <div class="text-right">
        <a
          href="https://beabee.io"
          class="flex items-center justify-end gap-1 font-bold"
        >
          beabee
          <UIcon name="i-lucide-external-link" class="size-3" />
        </a>
        <a
          v-if="canAdmin"
          href="https://beabee.io/#Newsletter"
          class="block text-main"
        >
          {{ t('footer.joinCommunity') }}
        </a>
        <span v-else class="text-muted">{{ t('footer.poweredBy') }}</span>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import AppLogo from './AppLogo.vue';
import { canAdmin, generalContent } from '../store';

const { t } = useI18n();
</script>
