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
        :operations="calloutTagOperations"
        :breadcrumbs="breadcrumbs"
        type="response"
      />
    </template>
    <template #col2>
      <CalloutReviewerManager :callout-id="callout.id" />
    </template>
  </App2ColGrid>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import TagManager from '@components/tag/TagManager.vue';
import { calloutTagOperations } from '@utils/api/callout';
import type { GetCalloutDataWith } from '@beabee/beabee-common';
import App2ColGrid from '@components/App2ColGrid.vue';
import CalloutReviewerManager from '@components/callout/CalloutReviewerManager.vue';

defineProps<{
  callout: GetCalloutDataWith<'form'>;
}>();

const { t } = useI18n();

const breadcrumbs = computed(() => [{ title: t('tags.manageTags') }]);
</script>
