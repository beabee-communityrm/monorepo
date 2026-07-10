<route lang="yaml">
name: profileAccount
meta:
  pageTitle: accountPage.title
</route>

<template>
  <!--
    AccountForm teleports its "unsaved changes" bar into this outer,
    full-width div (as a sibling after the max-w-2xl column below) so it:
    - spans the width of the main content area, not the narrow column
      and not the full viewport (which would overlap the sidebar)
    - has genuine room to be `position: sticky` within — a sticky element
      is bounded by its immediate parent's box, so teleporting it into an
      otherwise-empty target div (no taller than the bar itself) meant it
      had nowhere to "stick" and just sat in normal flow. This outer div is
      as tall as the whole page's content, so stickiness works properly.
    -mb-4/md:-mb-5 cancels the layout's own bottom padding so the bar sits
    flush against the footer (no gap) once it's no longer stuck.
  -->
  <div id="account-page" class="-mb-4 md:-mb-5">
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
      </Suspense>
      <ChangePassword />
      <SetMFA contact-id="me" />

      <p class="text-muted px-1 text-xs">
        <span class="text-primary font-medium">*</span>
        {{ t('accountPage.requiredFields') }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import AccountForm from '../../components/pages/profile/account/AccountForm.vue';
import ChangePassword from '../../components/pages/profile/account/ChangePassword.vue';
import SetMFA from '../../components/pages/profile/account/SetMFA.vue';

const { t } = useI18n();
</script>
