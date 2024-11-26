<route lang="yaml">
name: adminContactTags
meta:
  pageTitle: menu.contacts
  role: admin
</route>

<template>
  <App2ColGrid>
    <template #col1>
      <TagManager
        :operations="contactTagOperations"
        :breadcrumbs="breadcrumbs"
        type="contact"
      />
    </template>
  </App2ColGrid>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import TagManager from '@components/tag/TagManager.vue';
import { contactTagOperations } from '@utils/api/contact';
import App2ColGrid from '@components/App2ColGrid.vue';

const { t } = useI18n();

const breadcrumbs = computed(() => [
  { title: t('menu.contacts'), to: '/admin/contacts', icon: faUsers },
  { title: t('tags.manageTags') },
]);
</script>
