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
      no-update
      @add="handleAddReviewer"
      @delete="handleDeleteReviewer"
    >
      <template #view="{ item }">
        <router-link :to="`/admin/contacts/${item.contact.id}`">
          <font-awesome-icon :icon="faUser" class="mr-2" />{{
            item.contact.displayName
          }}
        </router-link>
      </template>

      <template #form="{ data }">
        <div class="mb-4">
          <AppInput
            v-model="data.contactId"
            :label="t('calloutReviewerManager.contact')"
            required
          />
        </div>
      </template>
    </ItemManager>
  </div>
</template>

<script lang="ts" setup>
import type { GetCalloutReviewerData } from '@beabee/beabee-common';
import { AppInput } from '@beabee/vue';

import AppHeading from '@components/AppHeading.vue';
import ItemManager from '@components/item-manager/ItemManager.vue';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { client } from '@utils/api';
import { reactive, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

interface CalloutReviewerFormData {
  contactId: string;
}

const props = defineProps<{
  calloutId: string;
}>();

const { t } = useI18n();

const reviewers = ref<GetCalloutReviewerData[]>([]);

async function handleAddReviewer(data: CalloutReviewerFormData) {
  await client.callout.reviewer.add(props.calloutId, data.contactId);
  reviewers.value = await client.callout.reviewer.list(props.calloutId);
}

async function handleDeleteReviewer(reviewer: GetCalloutReviewerData) {
  await client.callout.reviewer.delete(props.calloutId, reviewer.id);
  reviewers.value = await client.callout.reviewer.list(props.calloutId);
}

function reviewerToFormData(
  reviewer?: GetCalloutReviewerData
): CalloutReviewerFormData {
  return reactive({
    contactId: reviewer?.contact.id || '',
  });
}

watchEffect(async () => {
  reviewers.value = await client.callout.reviewer.list(props.calloutId);
});
</script>
