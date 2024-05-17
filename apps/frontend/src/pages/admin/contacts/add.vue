<route lang="yaml">
name: adminContactsAdd
meta:
  pageTitle: addContact.title
  role: admin
</route>

<template>
  <PageTitle :title="t('addContact.title')" border></PageTitle>
  <App2ColGrid>
    <template #col1>
      <AppForm
        :button-text="t('actions.save')"
        :success-text="t('addContact.contactSaved')"
        @submit.prevent="handleSubmit"
      >
        <section class="mb-8">
          <ContactBasicFields
            v-model:email="data.email"
            v-model:first-name="data.firstname"
            v-model:last-name="data.lastname"
            optional-names
          />
          <AppCheckbox
            v-model="data.subscribeToNewsletter"
            :label="t('addContact.subscribeToNewsletter')"
            class="mb-4"
          />
        </section>
        <section class="mb-8">
          <AppHeading>{{ t('contactOverview.roles') }}</AppHeading>
          <RoleEditor
            :roles="data.roles"
            @delete="handleDeleteRole"
            @update="handleUpdateRole"
          />
        </section>
        <section class="mb-8">
          <AppHeading>{{ t('contactOverview.contribution') }}</AppHeading>
          <ContactContributionFields v-model="data.contribution" />
        </section>
        <template #buttons="{ disabled }">
          <AppButton
            type="submit"
            variant="linkOutlined"
            :disabled="disabled"
            @click="addAnother = true"
          >
            {{ t('actions.saveAndAnother') }}
          </AppButton>
        </template>
      </AppForm>
    </template>
  </App2ColGrid>
</template>

<script lang="ts" setup>
import {
  ContributionType,
  NewsletterStatus,
  type RoleType,
} from '@beabee/beabee-common';
import useVuelidate from '@vuelidate/core';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

import App2ColGrid from '@components/App2ColGrid.vue';
import AppHeading from '@components/AppHeading.vue';
import type { UpdateContribution } from '@components/contact/contact.interface';
import ContactBasicFields from '@components/contact/ContactBasicFields.vue';
import ContactContributionFields from '@components/contact/ContactContributionFields.vue';
import AppButton from '@components/button/AppButton.vue';
import AppCheckbox from '@components/forms/AppCheckbox.vue';
import AppForm from '@components/forms/AppForm.vue';
import PageTitle from '@components/PageTitle.vue';
import RoleEditor from '@components/role/RoleEditor.vue';

import { addBreadcrumb } from '@store/breadcrumb';

import { createContact } from '@utils/api/contact';

import type { ContactRoleData } from '@type';

const { t } = useI18n();
const router = useRouter();

addBreadcrumb(
  computed(() => [
    { title: t('menu.contacts'), to: '/admin/contacts', icon: faUsers },
    { title: t('contacts.addContact'), to: '/admin/contacts/new' },
  ])
);

const initialData = () => ({
  email: '',
  firstname: '',
  lastname: '',
  subscribeToNewsletter: false,
  roles: [] as ContactRoleData[],
  contribution: {
    type: ContributionType.None,
    amount: undefined,
    period: undefined,
    source: undefined,
    reference: undefined,
  } as UpdateContribution,
});
const data = reactive(initialData());
const addAnother = ref(false);

const validation = useVuelidate();

function handleUpdateRole(role: ContactRoleData) {
  const existingRole = data.roles.find((r) => r.role === role.role);
  if (existingRole) {
    existingRole.dateAdded = role.dateAdded;
    existingRole.dateExpires = role.dateExpires;
  } else {
    data.roles.push(role);
  }
}

function handleDeleteRole(roleName: RoleType) {
  data.roles = data.roles.filter((role) => role.role !== roleName);
}

async function saveContact() {
  const contribution =
    data.contribution.type === ContributionType.None
      ? {
          type: ContributionType.None as const,
          amount: undefined,
          period: undefined,
        }
      : data.contribution.type === ContributionType.Manual
        ? { ...data.contribution, type: ContributionType.Manual as const }
        : undefined;

  return await createContact({
    email: data.email,
    firstname: data.firstname,
    lastname: data.lastname,
    roles: data.roles,
    contribution,
    ...(data.subscribeToNewsletter && {
      profile: {
        newsletterStatus: NewsletterStatus.Subscribed,
      },
    }),
  });
}

async function handleSubmit() {
  const contact = await saveContact();
  if (addAnother.value) {
    Object.assign(data, initialData());
    validation.value.$reset();
    addAnother.value = false;
  } else {
    router.push('/admin/contacts/' + contact.id);
  }
}
</script>
