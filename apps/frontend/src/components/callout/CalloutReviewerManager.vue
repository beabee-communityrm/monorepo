<template>
  <div>
    <AppHeading>{{ t('calloutReviewerManager.title') }}</AppHeading>
    <ItemManager
      :items="reviewers"
      :item-to-data="reviewerToFormData"
      :add-button-text="t('calloutReviewerManager.add')"
      :delete-title="t('calloutReviewerManager.confirmDelete.title')"
      :delete-text="
        (reviewer) =>
          t('calloutReviewerManager.confirmDelete.text', {
            reviewerName: reviewer.contact.displayName,
          })
      "
      @add="handleAddReviewer"
      @update="handleUpdateReviewer"
      @delete="handleDeleteReviewer"
    >
      <template #view="{ item }">
        <router-link :to="`/admin/contacts/${item.contact.id}`">
          <font-awesome-icon :icon="faUser" class="mr-2" />{{
            item.contact.displayName
          }}
        </router-link>
        <AppTag v-if="item.canEdit" tag="Editor" class="ml-2">Editor</AppTag>
      </template>

      <template #form="{ data, mode }">
        <div class="mb-4">
          <AppInput
            v-model="data.contactId"
            :label="t('calloutReviewerManager.contact')"
            :disabled="mode === 'update'"
            required
          />
        </div>
        <AppCheckbox
          v-model="data.canEdit"
          :label="t('calloutReviewerManager.canEdit')"
          class="mb-4"
        />
      </template>
    </ItemManager>
  </div>
</template>

<script lang="ts" setup>
import type {
  CreateCalloutReviewerData,
  GetCalloutReviewerData,
} from '@beabee/beabee-common';
import {
  AppCheckbox,
  AppHeading,
  AppInput,
  AppTag,
  ItemManager,
} from '@beabee/vue';

import { faUser } from '@fortawesome/free-solid-svg-icons';
import { client } from '@utils/api';
import { reactive, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  calloutId: string;
}>();

const { t } = useI18n();

const reviewers = ref<GetCalloutReviewerData[]>([]);

async function handleAddReviewer(data: CreateCalloutReviewerData) {
  await client.callout.reviewer.add(props.calloutId, data);
  reviewers.value = await client.callout.reviewer.list(props.calloutId);
}

async function handleUpdateReviewer(
  reviewer: GetCalloutReviewerData,
  data: CreateCalloutReviewerData
) {
  await client.callout.reviewer.update(props.calloutId, reviewer.id, {
    canEdit: data.canEdit,
  });
  reviewers.value = await client.callout.reviewer.list(props.calloutId);
}

async function handleDeleteReviewer(reviewer: GetCalloutReviewerData) {
  await client.callout.reviewer.delete(props.calloutId, reviewer.id);
  reviewers.value = await client.callout.reviewer.list(props.calloutId);
}

function reviewerToFormData(
  reviewer?: GetCalloutReviewerData
): CreateCalloutReviewerData {
  return reactive({
    contactId: reviewer?.contact.id || '',
    canEdit: reviewer?.canEdit || false,
  });
}

watchEffect(async () => {
  reviewers.value = await client.callout.reviewer.list(props.calloutId);
});
</script>
