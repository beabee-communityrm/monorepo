<route lang="yaml">
name: adminCalloutViewResponsesTags
meta:
  pageTitle: menu.callouts
</route>

<template>
  <TagManager
    :entity-id="callout.id"
    :operations="calloutTagOperations"
    :breadcrumbs="breadcrumbs"
    type="response"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import TagManager from '@components/tag/TagManager.vue';
import { calloutTagOperations } from '@utils/api/callout';
import type { GetCalloutDataWith } from '@beabee/beabee-common';

defineProps<{
  callout: GetCalloutDataWith<'form'>;
}>();

const { t } = useI18n();

const breadcrumbs = computed(() => [{ title: t('tags.manageTags') }]);
</script>
