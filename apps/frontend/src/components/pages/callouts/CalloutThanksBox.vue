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
  </AppMessageBox>
</template>

<script lang="ts" setup>
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import AppMessageBox from '@components/AppMessageBox.vue';

import type { GetCalloutDataWith } from '@beabee/beabee-common';

defineProps<{
  callout: GetCalloutDataWith<'form'>;
}>();
</script>
