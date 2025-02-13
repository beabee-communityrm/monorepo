<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <div class="grid grid-cols-2 gap-6">
      <div class="col-span-1">
        <AppRadioGroup
          v-model="data.useMailchimpSync"
          name="useMailchimpSync"
          label="Use Mailchimp sync"
          :options="[
            [true, 'Yes'],
            [false, 'No'],
          ]"
        />
      </div>
      <p class="col-span-1 mt-6 text-sm text-grey">
        You can connect your callout to Mailchimp to trigger automatic emails
        and cross data from the answers with your newsletter subscriber
        profiles.
      </p>
    </div>
    <div v-show="data.useMailchimpSync" class="mt-3 grid grid-cols-2 gap-6">
      <div class="col-span-1">
        <p>
          <b>Select the fields</b> you want to sync with Mailchimp, making use
          of a feature called Merge Tags.
        </p>

        <div class="flex flex-col items-center md:flex-row">
          <AppSelect
            v-model="foo"
            :items="[
              { id: '1', label: '-' },
              { id: '2', label: 'age-group' },
            ]"
          />
          <span class="ml-3 mr-2">
            <font-awesome-icon :icon="faLink" />
          </span>
          <AppSelect
            v-model="foo"
            :items="[
              { id: '1', label: '-' },
              { id: '2', label: 'mailchimp-age-group' },
            ]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import AppRadioGroup from '../../../../forms/AppRadioGroup.vue';
import type { MailchimpSyncStepProps } from '../callouts.interface';
import AppSelect from '../../../../forms/AppSelect.vue';
import { faLink } from '@fortawesome/free-solid-svg-icons';

const emit = defineEmits(['update:validated']);
defineProps<{ data: MailchimpSyncStepProps }>();

const foo = '';
onMounted(() => emit('update:validated', true));
</script>
