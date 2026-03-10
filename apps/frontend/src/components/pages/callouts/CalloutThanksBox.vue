<template>
  <AppMessageBox
    :title="callout.thanksTitle"
    :icon="faThumbsUp"
    variant="success"
  >
    <div
      class="content-message font-normal text-body-80"
      v-html="callout.thanksText"
    />
    <p
      v-if="
        callout.access === CalloutAccess.Guest &&
        !callout.allowMultiple &&
        !currentUser
      "
      class="mt-4 text-body-80"
    >
      {{ t('calloutThanksPage.oneResponseWarning') }}
    </p>
  </AppMessageBox>
</template>

<script lang="ts" setup>
import { CalloutAccess, type GetCalloutDataWith } from '@beabee/beabee-common';
import { AppMessageBox } from '@beabee/vue';

import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';

import { currentUser } from '#store/currentUser';

defineProps<{
  callout: GetCalloutDataWith<'form'>;
}>();

const { t } = useI18n();
</script>
