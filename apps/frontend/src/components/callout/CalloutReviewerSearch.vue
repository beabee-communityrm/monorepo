<template>
  <AppSearchInput
    v-model="email"
    :placeholder="t('calloutReviewerManager.search.placeholder')"
    :disabled="props.disabled"
    @update:model-value="handleSearch"
  />
  <AppNotification
    v-if="!emailExists && email.length > 0"
    :title="t('calloutReviewerManager.search.error.title')"
    variant="error"
  >
    <p>{{ t('calloutReviewerManager.search.error.message') }}</p>
  </AppNotification>
  <AppNotification
    v-if="emailExists && email.length > 0"
    :title="t('calloutReviewerManager.search.successMessage')"
    variant="success"
  >
  </AppNotification>
</template>

<script lang="ts" setup>
import {
  type GetCalloutReviewerData,
  GetContactWith,
  type RuleGroup,
} from '@beabee/beabee-common';
import { AppNotification, AppSearchInput } from '@beabee/vue';

import { client } from '@utils/api';
import useVuelidate from '@vuelidate/core';
import { not } from '@vuelidate/validators';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const contactId = defineModel<string>('contactId', { required: true });
const props = defineProps<{
  reviewers: GetCalloutReviewerData[];
  disabled?: boolean;
}>();

const email = ref<string>('');
const emailExists = ref(false);

function getSearchRules(type: 'email' | 'id', data: string): RuleGroup {
  return {
    condition: 'AND',
    rules: [{ field: type, operator: 'equal', value: [data] }],
  };
}

async function handleSearch(type: 'email' | 'id', data: string) {
  const query = {
    rules: getSearchRules(type, data),
  };
  const contact = await client.contact.list(query, [
    GetContactWith.Profile,
    GetContactWith.Roles,
  ]);
  if (contact.items.length) {
    contactId.value = contact.items[0].id;
    email.value = contact.items[0].email;
    emailExists.value = true;
  } else {
    emailExists.value = false;
  }
}

onMounted(() => {
  if (contactId.value) {
    handleSearch('id', contactId.value);
  }
});

const emit = defineEmits(['update:validation']);

const rules = {
  v: {
    email: () => emailExists.value,
    notEmpty: not((value: string) => value === ''),
  },
};

const validation = useVuelidate(rules, { v: emailExists });

watch(validation, (newState) => {
  emit('update:validation', !newState.$invalid);
});
</script>
