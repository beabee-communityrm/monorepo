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
      <ActionButton
        :icon="faEye"
        :to="`/crowdnewsroom/${callout.slug}?preview`"
      >
        {{
          callout.status === ItemStatus.Open ||
          callout.status === ItemStatus.Ended
            ? t('actions.view')
            : t('actions.preview')
        }}
      </ActionButton>
      <template v-if="canEdit">
        <ActionButton
          v-if="canEdit"
          :icon="faPencilAlt"
          :to="'/admin/crowdnewsroom/edit/' + callout.slug"
        >
          {{ t('actions.edit') }}
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
      </template>
      <template v-if="canAdmin">
        <ActionButton :icon="faClone" @click="replicateThisCallout()">
          {{ t('actions.replicate') }}
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
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { type GetCalloutDataWith, ItemStatus } from '@beabee/beabee-common';
import {
  ActionButton,
  AppConfirmDialog,
  AppHeading,
  AppInfoList,
  AppInfoListItem,
  addNotification,
} from '@beabee/vue';

import {
  faClone,
  faEye,
  faHourglassEnd,
  faHourglassStart,
  faPencilAlt,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import CalloutSummary from '#components/callout/CalloutSummary.vue';
import { canAdmin } from '#store/currentUser';
import { client } from '#utils/api';

const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseCount'>;
}>();
const { t } = useI18n();

const router = useRouter();

const canEdit = ref(false);
const showDeleteModal = ref(false);

async function confirmDeleteCallout() {
  await client.callout.delete(props.callout.slug);
  addNotification({
    title: t('calloutAdmin.deleted'),
    variant: 'error',
  });
  router.push({ path: '/admin/crowdnewsroom' });
}

async function endThisCallout() {
  await client.callout.update(props.callout.slug, { expires: new Date() });
  addNotification({
    title: t('calloutAdmin.ended'),
    variant: 'success',
  });
  router.push({ path: '/admin/crowdnewsroom' });
}

async function reopenThisCallout() {
  await client.callout.update(props.callout.slug, { expires: null });
  addNotification({
    title: t('calloutAdmin.reopened'),
    variant: 'success',
  });
  router.push({ path: '/admin/crowdnewsroom' });
}

async function replicateThisCallout() {
  const newCallout = await client.callout.clone(props.callout.id, {
    starts: null,
    expires: null,
  });
  router.push({
    path: '/admin/crowdnewsroom/edit/' + newCallout.slug,
    query: { replicated: null },
  });
}

onBeforeMount(async () => {
  if (canAdmin.value) {
    canEdit.value = true;
  } else {
    const reviewers = await client.callout.reviewer.list(props.callout.id, {
      rules: {
        condition: 'AND',
        rules: [
          { field: 'contact', operator: 'equal', value: ['me'] },
          { field: 'canEdit', operator: 'equal', value: [true] },
        ],
      },
    });
    canEdit.value = reviewers.length > 0;
  }
});
</script>
