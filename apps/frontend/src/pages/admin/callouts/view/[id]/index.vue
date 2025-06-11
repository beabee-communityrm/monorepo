<route lang="yaml">
name: adminCalloutViewOverview
meta:
  pageTitle: menu.callouts
</route>

<template>
  <div class="flex flex-col-reverse gap-8 lg:flex-row lg:justify-between">
    <div class="flex-initial basis-1/2">
      <AppHeading>{{ t('calloutAdminOverview.summary') }}</AppHeading>

      <div class="mb-8 rounded bg-white p-4">
        <CalloutSummary :callout="callout" />
      </div>

      <AppHeading>{{ t('calloutAdminOverview.settings.label') }}</AppHeading>
      <AppInfoList class="mb-4">
        <AppInfoListItem
          :name="t('calloutAdminOverview.settings.openTo.label')"
          :value="
            callout.access === 'member'
              ? t('calloutAdminOverview.settings.openTo.membersOnly')
              : t('calloutAdminOverview.settings.openTo.everyone')
          "
        />
        <AppInfoListItem
          v-if="callout.access !== 'member'"
          :name="t('calloutAdminOverview.settings.contactInfo.label')"
          :value="
            callout.access === 'guest'
              ? t('calloutAdminOverview.settings.contactInfo.required')
              : t('calloutAdminOverview.settings.contactInfo.optional')
          "
        />
        <AppInfoListItem
          :name="t('calloutAdminOverview.settings.answers.label')"
          :value="
            callout.allowUpdate
              ? t('calloutAdminOverview.settings.answers.editable')
              : t('calloutAdminOverview.settings.answers.final')
          "
        />
        <AppInfoListItem
          :name="t('calloutAdminOverview.settings.endsWith.label')"
          :value="
            callout.thanksRedirect
              ? t('calloutAdminOverview.settings.endsWith.redirect')
              : t('calloutAdminOverview.settings.endsWith.message')
          "
        />
      </AppInfoList>
    </div>
    <div class="flex-0 flex flex-wrap gap-2 lg:flex-col">
      <ActionButton :icon="faEye" :to="`/callouts/${callout.slug}?preview`">
        {{
          callout.status === ItemStatus.Open ||
          callout.status === ItemStatus.Ended
            ? t('actions.view')
            : t('actions.preview')
        }}
      </ActionButton>
      <ActionButton
        :icon="faPencilAlt"
        :to="'/admin/callouts/edit/' + callout.slug"
      >
        {{ t('actions.edit') }}
      </ActionButton>
      <ActionButton :icon="faClone" @click="replicateThisCallout()">
        {{ t('actions.replicate') }}
      </ActionButton>
      <ActionButton
        v-if="callout.status === ItemStatus.Open"
        :icon="faHourglassEnd"
        @click="endThisCallout()"
      >
        {{ t('actions.endnow') }}
      </ActionButton>
      <ActionButton
        v-if="callout.status === ItemStatus.Ended"
        :icon="faHourglassStart"
        @click="reopenThisCallout()"
      >
        {{ t('actions.reopen') }}
      </ActionButton>
      <ActionButton :icon="faTrash" @click="showDeleteModal = true">
        {{ t('actions.delete') }}
      </ActionButton>
      <AppConfirmDialog
        :open="showDeleteModal"
        :title="t('calloutAdminOverview.actions.confirmDelete.title')"
        :cancel="t('actions.noBack')"
        :confirm="t('actions.yesDelete')"
        variant="danger"
        @close="showDeleteModal = false"
        @confirm="confirmDeleteCallout"
      >
        <p>{{ t('calloutAdminOverview.actions.confirmDelete.text') }}</p>
      </AppConfirmDialog>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { type GetCalloutDataWith, ItemStatus } from '@beabee/beabee-common';
import { ActionButton } from '@beabee/vue/components';
import { addNotification } from '@beabee/vue/store/notifications';

import AppConfirmDialog from '@components/AppConfirmDialog.vue';
import AppHeading from '@components/AppHeading.vue';
import AppInfoList from '@components/AppInfoList.vue';
import AppInfoListItem from '@components/AppInfoListItem.vue';
import CalloutSummary from '@components/callout/CalloutSummary.vue';
import {
  faClone,
  faEye,
  faHourglassEnd,
  faHourglassStart,
  faPencilAlt,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { client } from '@utils/api';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseCount'>;
}>();
const { t } = useI18n();

const router = useRouter();

const showDeleteModal = ref(false);

async function confirmDeleteCallout() {
  await client.callout.delete(props.callout.slug);
  addNotification({
    title: t('calloutAdmin.deleted'),
    variant: 'error',
  });
  router.push({ path: '/admin/callouts' });
}

async function endThisCallout() {
  await client.callout.update(props.callout.slug, { expires: new Date() });
  addNotification({
    title: t('calloutAdmin.ended'),
    variant: 'success',
  });
  router.push({ path: '/admin/callouts' });
}

async function reopenThisCallout() {
  await client.callout.update(props.callout.slug, { expires: null });
  addNotification({
    title: t('calloutAdmin.reopened'),
    variant: 'success',
  });
  router.push({ path: '/admin/callouts' });
}

async function replicateThisCallout() {
  const newCallout = await client.callout.clone(props.callout.id, {
    starts: null,
    expires: null,
  });
  router.push({
    path: '/admin/callouts/edit/' + newCallout.slug,
    query: { replicated: null },
  });
}
</script>
