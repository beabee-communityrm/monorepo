<route lang="yaml">
name: profileAccount
meta:
  pageTitle: accountPage.title
</route>

<template>
  <div class="mx-auto flex max-w-2xl flex-col gap-6">
    <div
      class="bg-elevated text-muted flex items-start gap-3 rounded-xl px-4 py-3 text-xs"
    >
      <UIcon
        name="i-lucide-shield"
        class="text-primary mt-0.5 size-4 shrink-0"
      />
      <p>{{ t('accountPage.subTitle') }}</p>
    </div>

    <Suspense>
      <AccountForm />
      <template #fallback>
        <!--
          AccountForm has two top-level `await`s (fetching join/setup content
          and the contact record), making it an async component — without
          this fallback, Suspense renders nothing at all for it while those
          requests are in flight, so the page jumps once it pops in below
          the (synchronous) cards further down. This skeleton reserves
          roughly the same height, using the real card titles (they don't
          depend on the fetched data) so only the field rows are skeletons.
        -->
        <div class="flex flex-col gap-6">
          <AppSectionCard
            icon="i-lucide-user-round"
            :title="t('accountPage.contactInformation')"
          >
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <USkeleton class="h-9 w-full" />
              <USkeleton class="h-9 w-full" />
            </div>
            <USkeleton class="h-9 w-full" />
            <USkeleton class="h-9 w-full" />
          </AppSectionCard>
          <AppSectionCard
            icon="i-lucide-map-pin"
            :title="t('accountPage.deliveryAddress')"
          >
            <USkeleton class="h-9 w-full" />
            <USkeleton class="h-9 w-full" />
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
              <USkeleton class="h-9 w-full" />
              <USkeleton class="h-9 w-full" />
            </div>
          </AppSectionCard>
        </div>
      </template>
    </Suspense>
    <ChangePassword />
    <SetMFA contact-id="me" />

    <p class="text-muted px-1 text-xs">
      <span class="text-primary font-medium">*</span>
      {{ t('accountPage.requiredFields') }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { AppSectionCard } from '@beabee/vue';

import { useI18n } from 'vue-i18n';

import AccountForm from '../../components/pages/profile/account/AccountForm.vue';
import ChangePassword from '../../components/pages/profile/account/ChangePassword.vue';
import SetMFA from '../../components/pages/profile/account/SetMFA.vue';

const { t } = useI18n();
</script>
