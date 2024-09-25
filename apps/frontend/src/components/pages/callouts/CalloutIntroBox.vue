<template>
  <div>
    <div v-if="callout.status === ItemStatus.Open" class="mb-6">
      <AppExpandableBox
        :button-icon="faShareNodes"
        :button-text="t('actions.share')"
      >
        <CalloutSharingBox :slug="callout.slug" />
      </AppExpandableBox>
    </div>

    <img class="mb-6 w-full" :src="callout.image" />

    <div class="content-message mb-6 text-lg" v-html="callout.intro" />
  </div>
</template>
<script setup lang="ts">
import { ItemStatus, type GetCalloutDataWith } from '@beabee/beabee-common';
import { faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';
import CalloutSharingBox from './CalloutSharingBox.vue';
import AppExpandableBox from '@components/AppExpandableBox.vue';

defineProps<{ callout: GetCalloutDataWith<'form'> }>();

const { t } = useI18n();
</script>
