<route lang="yaml">
name: adminContactTags
meta:
  pageTitle: menu.contacts
  role: admin
</route>

<template>
  <TagManager :operations="contactTagOperations" :breadcrumbs="breadcrumbs" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import TagManager from '@components/tag/TagManager.vue';
import { contactTagOperations } from '@utils/api/contact';

const { t } = useI18n();

const breadcrumbs = computed(() => [
  { title: t('menu.contacts'), to: '/admin/contacts', icon: faUsers },
  { title: t('tags.manageTags') },
]);
</script>
