<route lang="yaml">
name: adminCalloutNew
meta:
  pageTitle: menu.callouts
  role: admin
  layout: FlexibleDashboard
</route>

<template>
  <div v-if="tabs" class="flex max-h-full min-h-0 flex-1 flex-col">
    <PageTitle :title="pageTitle" border no-collapse>
      <div class="flex items-center gap-2">
        <AppAsyncButton
          v-if="!isLive"
          variant="primaryOutlined"
          :icon="faEye"
          :disabled="!status"
          @click="handlePreview"
        >
          {{ t('actions.preview') }}
        </AppAsyncButton>
        <AppAsyncButton variant="primaryOutlined" @click="handleSaveDraft">
          {{
            isNewOrDraft ? t('actions.saveDraft') : t('actions.revertToDraft')
          }}
        </AppAsyncButton>
        <div
          v-if="!isLive"
          class="mr-3 self-stretch border-r border-r-primary-40 pl-2"
        />
        <AppAsyncButton :disabled="validation.$invalid" @click="handleUpdate">
          {{ updateAction }}
        </AppAsyncButton>
      </div>
    </PageTitle>
    <CalloutHorizontalTabs :data="tabs" :status="status" />
  </div>
</template>

<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import { AppAsyncButton, PageTitle } from '@beabee/vue';
import { addNotification } from '@beabee/vue/store/notifications';

import { faBullhorn, faEye } from '@fortawesome/free-solid-svg-icons';
import useVuelidate from '@vuelidate/core';
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import type { CalloutHorizontalTabsData } from '#components/pages/admin/callouts/CalloutHorizontalTabs.interface';
import CalloutHorizontalTabs from '#components/pages/admin/callouts/CalloutHorizontalTabs.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { convertCalloutToTabs, convertStepsToCallout } from '#utils/callouts';

/**
 * Props for the CalloutNew component
 */
export interface CalloutNewProps {
  /** Optional ID of the callout to edit */
  id?: string;
}

const props = defineProps<CalloutNewProps>();
const { t } = useI18n();
const router = useRouter();
const validation = useVuelidate();

// State
const tabs = ref<CalloutHorizontalTabsData>();
const status = ref<ItemStatus>();
const lastSaved = ref<Date>();
const now = ref(new Date());

// Computed Properties
const pageTitle = computed(() =>
  status.value
    ? t('editCallout.title', {
        title: tabs.value?.titleAndImage.title.default,
      })
    : t('callout.builder.title')
);

const canStartNow = computed(
  () =>
    tabs.value &&
    (!tabs.value.settings.hasStartDate ||
      new Date(
        tabs.value.settings.startDate + 'T' + tabs.value.settings.startTime
      ) <= now.value)
);

const isLive = computed(
  () => status.value === ItemStatus.Open || status.value === ItemStatus.Ended
);

const isNewOrDraft = computed(
  () => !status.value || status.value === ItemStatus.Draft
);

const isUpdateAction = computed(
  () =>
    isLive.value ||
    (status.value === ItemStatus.Scheduled && !canStartNow.value)
);

const updateAction = computed(() =>
  isUpdateAction.value
    ? t('actions.update')
    : canStartNow.value
      ? t('actions.publish')
      : t('actions.schedule')
);

// Breadcrumb
addBreadcrumb(
  computed(() =>
    tabs.value
      ? [
          {
            title: t('menu.callouts'),
            icon: faBullhorn,
            to: '/admin/crowdnewsroom',
          },
          ...(props.id
            ? [
                {
                  title: tabs.value?.titleAndImage.title.default,
                  to: '/admin/crowdnewsroom/view/' + props.id,
                },
                {
                  title: t('actions.edit'),
                  to: '/admin/crowdnewsroom/edit/' + props.id,
                },
              ]
            : [
                {
                  title: t('calloutsAdmin.addCallout'),
                  to: '/admin/crowdnewsroom/new',
                },
              ]),
        ]
      : []
  )
);

// Methods
async function saveCallout(asDraft = false) {
  if (!tabs.value) throw new Error('Steps are not set');

  const data = convertStepsToCallout(tabs.value);

  if (!data.variants.default.title) {
    data.variants.default.title = t('callout.builder.untitledCallout');
  }

  if (asDraft) {
    data.starts = null;
    data.expires = null;
  }

  const callout = props.id
    ? await client.callout.update(props.id, data)
    : await client.callout.create(data);

  lastSaved.value = new Date();
  return callout;
}

async function handleUpdate() {
  const callout = await saveCallout();
  addNotification({
    title: props.id
      ? t('calloutAdminOverview.updated')
      : t('calloutAdminOverview.created'),
    variant: 'success',
  });

  if (!isUpdateAction.value) {
    router.push({ path: '/admin/crowdnewsroom/view/' + callout.slug });
  }
}

async function handleSaveDraft() {
  const callout = await saveCallout(true);
  addNotification({
    title: 'Saved draft',
    variant: 'success',
  });

  router.push({ path: '/admin/crowdnewsroom/edit/' + callout.slug });

  // If reverting from other status then reset form
  if (!isNewOrDraft.value) {
    await reset();
  }
}

async function handlePreview() {
  // Browsers require window.open to be called synchronously
  const previewWindow = window.open('about:blank', 'preview');
  const callout = await saveCallout(status.value === ItemStatus.Draft);

  if (previewWindow) {
    previewWindow.location.href = `/crowdnewsroom/${callout.slug}?preview`;
  }
}

async function reset() {
  // Clear any existing tabs data to force form reset
  tabs.value = undefined;

  const callout = props.id
    ? await client.callout.get(props.id, [
        'form',
        'responseViewSchema',
        'variants',
      ])
    : undefined;

  tabs.value = convertCalloutToTabs(callout);
  status.value = callout?.status;
}

// Lifecycle Hooks
let interval: number | undefined;

onBeforeMount(() => {
  reset();
  interval = window.setInterval(() => (now.value = new Date()), 60000);
});

onBeforeUnmount(() => {
  if (interval) {
    clearInterval(interval);
    interval = undefined;
  }
});
</script>
