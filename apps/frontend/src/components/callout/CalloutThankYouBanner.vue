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
  <AppNoticeCard
    icon="i-lucide-circle-check"
    :title="callout.thanksTitle || t('common.thankYou')"
    color="success"
  >
    <div
      v-if="callout.thanksText"
      class="nuxt-prose"
      v-html="callout.thanksText"
    />

    <p v-if="submittedAt" class="text-muted">
      {{ t('callout.submittedOn', { date: formatLocale(submittedAt, 'PPP') }) }}
      <template v-if="!isOpen">{{ t('callout.closedNoEdit') }}</template>
    </p>

    <p v-if="showOneResponseWarning" class="text-muted">
      {{ t('calloutThanksPage.oneResponseWarning') }}
    </p>
  </AppNoticeCard>
</template>

<script lang="ts" setup>
import {
  CalloutAccess,
  type GetCalloutDataWith,
  ItemStatus,
} from '@beabee/beabee-common';
import { AppNoticeCard, formatLocale } from '@beabee/vue';

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
