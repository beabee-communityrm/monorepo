<route lang="yaml">
name: adminContactsEmailTemplatesEdit
meta:
  pageTitle: contacts.emailTemplates.editTitle
  role: admin
</route>

<template>
  <EmailTemplateEditor />
</template>

<script lang="ts" setup>
import EmailTemplateEditor from '#components/emails/EmailTemplateEditor.vue';
</script>
