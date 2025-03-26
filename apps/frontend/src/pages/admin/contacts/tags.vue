<route lang="yaml">
name: adminContactTags
meta:
  pageTitle: menu.contacts
  role: admin
</route>

<template>
  <App2ColGrid class="max-w-[1400px]">
    <template #col1>
      <TagManager :operations="client.contact.tag" type="contact" />
    </template>
  </App2ColGrid>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import TagManager from '@components/tag/TagManager.vue';
import { client } from '@utils/api';
import App2ColGrid from '@components/App2ColGrid.vue';
import { addBreadcrumb } from '@store/breadcrumb';

const { t } = useI18n();

addBreadcrumb(
  computed(() => [
    { title: t('menu.contacts'), to: '/admin/contacts', icon: faUsers },
    { title: t('tags.manageTags') },
  ])
);
</script>
