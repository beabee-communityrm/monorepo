<route lang="yaml">
name: adminSettingsApikeys
meta:
  pageTitle: menu.adminSettings
  role: admin
</route>

<template>
  <AppConfirmDialog
    :open="!!apiKeyToDelete"
    :title="t('adminSettings.apikey.confirmDelete.title')"
    :cancel="t('actions.noBack')"
    :confirm="t('actions.yesDelete')"
    variant="danger"
    @close="apiKeyToDelete = ''"
    @confirm="confirmDeleteApiKey"
  >
    <p>{{ t('adminSettings.apikey.confirmDelete.text') }}</p>
  </AppConfirmDialog>

  <AppConfirmDialog
    :open="!!newApiKeySecret"
    :title="t('adminSettings.apikey.confirmCreate.title')"
    :confirm="t('actions.continue')"
    @close="newApiKeySecret = ''"
    @confirm="newApiKeySecret = ''"
  >
    <p class="mb-4">{{ t('adminSettings.apikey.confirmCreate.text') }}</p>
    <div class="flex gap-2">
      <pre class="overflow-scroll text-sm">{{ newApiKeySecret }} </pre>
      <AppButton
        :icon="faCopy"
        size="sm"
        variant="primaryOutlined"
        @click="copyToClipboard"
      />
    </div>
  </AppConfirmDialog>

  <AppPaginatedTable
    v-model:query="currentPaginatedQuery"
    keypath="adminSettings.apikey.showingOf"
    :headers="headers"
    :result="apiKeyTable"
    :row-class="
      (item) =>
        item.expires && item.expires < new Date() ? 'bg-danger-10' : ''
    "
    class="mb-8"
  >
    <template #value-id="{ item }"> {{ item.id }}_••••••••••••••••••</template>
    <template #value-createdAt="{ value }">
      <span class="whitespace-nowrap">{{ formatLocale(value, 'PP') }}</span>
    </template>
    <template #value-expires="{ value }">
      <span class="whitespace-nowrap">
        <AppTime v-if="value" :datetime="value" />
        <span v-else :title="t('adminSettings.apikey.expiresHelp')">
          <font-awesome-icon :icon="faWarning" />
          {{ t('adminSettings.apikey.expires.never') }}
        </span>
      </span>
    </template>
    <template #value-actions="{ item }">
      <AppButton
        :title="t('actions.delete')"
        :icon="faTrash"
        variant="dangerOutlined"
        size="sm"
        @click="apiKeyToDelete = item.id"
      />
    </template>
  </AppPaginatedTable>

  <App2ColGrid>
    <template #col1>
      <AppHeading>{{ t('adminSettings.apikey.create') }}</AppHeading>
      <AppForm :button-text="t('actions.create')" @submit="generateApiKey">
        <div class="mb-4">
          <AppInput
            v-model="newApiKeyData.description"
            :label="t('apiKey.data.description')"
            required
          />
        </div>
        <AppSelect
          v-model="newApiKeyData.expiresInDays"
          :label="t('apiKey.data.expires')"
          :items="expiresInOptions"
          :info-message="t('adminSettings.apikey.expiresHelp')"
          required
          class="mb-4"
        />
        <AppCheckbox
          v-if="newApiKeyData.expiresInDays === 0"
          :label="t('adminSettings.apikey.expiresNeverWarning')"
          required
          class="mb-4"
        />
      </AppForm>
    </template>
  </App2ColGrid>
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue';
import useVuelidate from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import { faCopy, faTrash, faWarning } from '@fortawesome/free-solid-svg-icons';
import { addDays } from 'date-fns';
import type { Paginated } from '@beabee/beabee-common';

import AppForm from '@components/forms/AppForm.vue';
import AppInput from '@components/forms/AppInput.vue';
import AppButton from '@components/button/AppButton.vue';
import AppConfirmDialog from '@components/AppConfirmDialog.vue';
import AppPaginatedTable from '@components/table/AppPaginatedTable.vue';
import type { Header } from '@components/table/table.interface';
import AppHeading from '@components/AppHeading.vue';
import App2ColGrid from '@components/App2ColGrid.vue';
import AppSelect from '@components/forms/AppSelect.vue';
import AppCheckbox from '@components/forms/AppCheckbox.vue';
import AppTime from '@components/AppTime.vue';

import { addNotification } from '@store/notifications';

import { formatLocale } from '@utils/dates';
import { definePaginatedQuery } from '@utils/pagination';
import { createApiKey, fetchApiKeys, deleteApiKey } from '@utils/api/api-key';

import type { GetApiKeyData } from '@type';

const { n, t } = useI18n();

const validation = useVuelidate();

const apiKeyToDelete = ref('');
const newApiKeySecret = ref('');

const initialData = () => ({
  description: '',
  expiresInDays: 30,
});
const newApiKeyData = ref(initialData());

const expiresInOptions = computed(() => {
  const neverExpiresOption = {
    id: 0,
    label: t('adminSettings.apikey.expires.never'),
  };
  const daysOptions = [30, 60, 90].map((days) => ({
    id: days,
    label: t('adminSettings.apikey.expires.days', { n: n(days) }),
  }));

  return [neverExpiresOption, ...daysOptions];
});

const headers: Header[] = [
  {
    value: 'description',
    text: t('apiKey.data.description'),
  },
  {
    value: 'id',
    text: t('apiKey.data.token'),
  },
  {
    value: 'createdAt',
    text: t('apiKey.data.createdAt'),
    align: 'right',
    sortable: true,
  },
  {
    value: 'expires',
    text: t('apiKey.data.expires'),
    align: 'right',
    sortable: true,
  },
  { value: 'actions', text: '', align: 'right' },
];

const apiKeyTable = ref<Paginated<GetApiKeyData>>();

const currentPaginatedQuery = definePaginatedQuery('createdAt');

async function generateApiKey() {
  const { description, expiresInDays } = newApiKeyData.value;
  const data = {
    description,
    expires: expiresInDays === 0 ? null : addDays(new Date(), expiresInDays),
  };
  newApiKeySecret.value = (await createApiKey(data)).token;

  newApiKeyData.value = initialData();
  validation.value.$reset();
  await refreshApiKeys();
}

async function refreshApiKeys() {
  apiKeyTable.value = await fetchApiKeys(currentPaginatedQuery.query);
}

async function confirmDeleteApiKey() {
  await deleteApiKey(apiKeyToDelete.value);
  apiKeyToDelete.value = '';
  await refreshApiKeys();
}

watchEffect(refreshApiKeys);

function copyToClipboard() {
  navigator.clipboard.writeText(newApiKeySecret.value);
  addNotification({
    title: t('adminSettings.apikey.copied'),
    variant: 'success',
  });
}
</script>
