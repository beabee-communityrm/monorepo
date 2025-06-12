<route lang="yaml">
name: adminCalloutViewResponsesTags
meta:
  pageTitle: menu.callouts
</route>

<template>
  <App2ColGrid>
    <template #col1>
      <TagManager
        :entity-id="callout.id"
        :operations="client.callout.tag"
        type="response"
      />
    </template>
    <template #col2>
      <CalloutReviewerManager :callout-id="callout.id" />
    </template>
  </App2ColGrid>
</template>

<script lang="ts" setup>
import type { GetCalloutDataWith } from '@beabee/beabee-common';
import { App2ColGrid } from '@beabee/vue';

import CalloutReviewerManager from '@components/callout/CalloutReviewerManager.vue';
import TagManager from '@components/tag/TagManager.vue';
import { addBreadcrumb } from '@store/breadcrumb';
import { client } from '@utils/api';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps<{
  callout: GetCalloutDataWith<'form'>;
}>();

const { t } = useI18n();

addBreadcrumb(computed(() => [{ title: t('tags.manageTags') }]));
</script>
