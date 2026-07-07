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
import { App2ColGrid } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import TagManager from '#components/tag/TagManager.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { routeIcons } from '#utils/route-nav';

const { t } = useI18n();

addBreadcrumb(
  computed(() => [
    {
      label: t('menu.contacts'),
      to: '/admin/contacts',
      icon: routeIcons.adminContacts,
    },
    { label: t('tags.manageTags') },
  ])
);
</script>
