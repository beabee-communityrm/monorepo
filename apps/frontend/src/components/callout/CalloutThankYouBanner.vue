<!--
  # CalloutThankYouBanner
  Confirms that the current user has responded to a CrowdNewsroom. The
  configured thank you message is always shown — it often says when to expect
  findings, which still applies once the CrowdNewsroom has closed — with the
  submission date and, when closed, a note that it can no longer be edited.

  `submittedAt` is optional because the thanks page shows this straight after a
  response is submitted, where the stored response hasn't been loaded.
-->
<template>
  <div class="bg-primary/5 border-primary/20 flex gap-3 rounded-md border p-4">
    <UIcon
      name="i-lucide-circle-check"
      class="text-primary mt-0.5 size-5 shrink-0"
      aria-hidden="true"
    />

    <div class="flex min-w-0 flex-col gap-1.5">
      <p class="text-primary text-base font-semibold">
        {{ callout.thanksTitle || t('common.thankYou') }}
      </p>
      <div
        v-if="callout.thanksText"
        class="nuxt-prose"
        v-html="callout.thanksText"
      />

      <p v-if="submittedAt" class="text-muted">
        {{
          t('callout.submittedOn', { date: formatLocale(submittedAt, 'PPP') })
        }}
        <template v-if="!isOpen">{{ t('callout.closedNoEdit') }}</template>
      </p>

      <p v-if="showOneResponseWarning" class="text-muted">
        {{ t('calloutThanksPage.oneResponseWarning') }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  CalloutAccess,
  type GetCalloutDataWith,
  ItemStatus,
} from '@beabee/beabee-common';
import { formatLocale } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { currentUser } from '#store';

const { t } = useI18n();

/** Props for CalloutThankYouBanner */
export interface CalloutThankYouBannerProps {
  /** The CrowdNewsroom that was responded to */
  callout: GetCalloutDataWith<'form'>;
  /** When the response was submitted, if it has been loaded */
  submittedAt?: Date;
}

const props = defineProps<CalloutThankYouBannerProps>();

const isOpen = computed(() => props.callout.status === ItemStatus.Open);

// A guest responding without an account can't be identified later, so they
// only get one response.
const showOneResponseWarning = computed(
  () =>
    props.callout.access === CalloutAccess.Guest &&
    !props.callout.allowMultiple &&
    !currentUser.value
);
</script>
