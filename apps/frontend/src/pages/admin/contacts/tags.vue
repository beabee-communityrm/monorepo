<route lang="yaml">
name: adminContactTags
meta:
  pageTitle: menu.contacts
  role: admin
</route>

<template>
  <App2ColGrid>
    <template #col1>
      <TagManager :operations="client.contact.tag" type="contact" />
    </template>
  </App2ColGrid>
</template>

<script lang="ts" setup>
import App2ColGrid from '@components/App2ColGrid.vue';
import TagManager from '@components/tag/TagManager.vue';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import { client } from '@utils/api';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

addBreadcrumb(
  computed(() => [
    { title: t('menu.contacts'), to: '/admin/contacts', icon: faUsers },
    { title: t('tags.manageTags') },
  ])
);
</script>
