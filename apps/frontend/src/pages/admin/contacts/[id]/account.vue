<route lang="yaml">
name: adminContactsViewAccount
meta:
  pageTitle: menu.contacts
  role: admin
</route>

<template>
  <App2ColGrid>
    <template #col1>
      <Suspense>
        <ContactUpdateAccount :id="contact.id" />
      </Suspense>
    </template>
    <template #col2>
      <div class="text-right">
        <ActionButton
          :icon="faTrash"
          variant="danger"
          @click="showDeleteModal = true"
        >
          {{ t('contactAccount.confirmDelete.title') }}
        </ActionButton>
      </div>
      <AppConfirmDialog
        :open="showDeleteModal"
        :title="t('contactAccount.confirmDelete.title')"
        :cancel="t('actions.noBack')"
        :confirm="t('actions.yesDelete')"
        variant="danger"
        @close="showDeleteModal = false"
        @confirm="handleDelete"
      >
        <i18n-t
          tag="p"
          class="mb-4"
          keypath="contactAccount.confirmDelete.text"
          :email="contact.email"
        >
          <template #email
            ><b>{{ contact.email }}</b></template
          >
        </i18n-t>
        <p>
          <b>{{ t('contactAccount.confirmDelete.warning') }}</b>
        </p>
      </AppConfirmDialog>
    </template>
  </App2ColGrid>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import ContactUpdateAccount from '@components/contact/ContactUpdateAccount.vue';
import App2ColGrid from '@components/App2ColGrid.vue';
import AppConfirmDialog from '@components/AppConfirmDialog.vue';
import { deleteContact } from '@utils/api/contact';
import ActionButton from '@components/button/ActionButton.vue';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { addNotification } from '@store/notifications';

import type { GetContactData } from '@type';

const props = defineProps<{ contact: GetContactData }>();

const { t } = useI18n();
const router = useRouter();

const showDeleteModal = ref(false);

async function handleDelete() {
  await deleteContact(props.contact.id);
  addNotification({
    variant: 'success',
    title: t('contactAccount.contactDeleted'),
  });

  router.push('/admin/contacts');
}
</script>
