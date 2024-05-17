<route lang="yaml">
name: adminCalloutNew
meta:
  pageTitle: menu.callouts
  role: admin
</route>

<template>
  <div v-if="steps">
    <PageTitle
      :title="
        status
          ? t('editCallout.title', { title: steps.titleAndImage.title.default })
          : t('createCallout.title')
      "
      border
      no-collapse
    >
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
        <div v-if="!isLive" class="h-4 border-r border-r-primary-40" />
        <AppAsyncButton variant="primaryOutlined" @click="handleSaveDraft">
          {{
            isNewOrDraft ? t('actions.saveDraft') : t('actions.revertToDraft')
          }}
        </AppAsyncButton>
        <AppAsyncButton :disabled="validation.$invalid" @click="handleUpdate">
          {{ updateAction }}
        </AppAsyncButton>
      </div>
    </PageTitle>
    <CalloutStepper :steps-props="steps" :status="status" />
  </div>
</template>

<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import { ref, onBeforeMount, computed, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import {
  createCallout,
  fetchCallout,
  updateCallout,
} from '../../../utils/api/callout';
import type { CalloutStepsProps } from '../../../components/pages/admin/callouts/callouts.interface';
import CalloutStepper from '../../../components/pages/admin/callouts/CalloutStepper.vue';
import {
  convertCalloutToSteps,
  convertStepsToCallout,
} from '../../../utils/callouts';
import PageTitle from '../../../components/PageTitle.vue';
import useVuelidate from '@vuelidate/core';
import AppAsyncButton from '../../../components/button/AppAsyncButton.vue';
import { addBreadcrumb } from '../../../store/breadcrumb';
import { addNotification } from '../../../store/notifications';
import { faBullhorn, faEye } from '@fortawesome/free-solid-svg-icons';

const props = defineProps<{ id?: string }>();

const { t } = useI18n();
const router = useRouter();
const validation = useVuelidate();

addBreadcrumb(
  computed(() =>
    steps.value
      ? [
          {
            title: t('menu.callouts'),
            icon: faBullhorn,
            to: '/admin/callouts',
          },
          ...(props.id
            ? [
                {
                  title: steps.value.titleAndImage.title.default,
                  to: '/admin/callouts/view/' + props.id,
                },
                {
                  title: t('actions.edit'),
                  to: '/admin/callouts/edit/' + props.id,
                },
              ]
            : [
                {
                  title: t('calloutsAdmin.addCallout'),
                  to: '/admin/callouts/new',
                },
              ]),
        ]
      : []
  )
);

const steps = ref<CalloutStepsProps>();
const status = ref<ItemStatus>();
const lastSaved = ref<Date>();

const now = ref(new Date());

const canStartNow = computed(
  () =>
    steps.value &&
    (steps.value.dates.startNow ||
      new Date(
        steps.value.dates.startDate + 'T' + steps.value.dates.startTime
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

async function saveCallout(asDraft = false) {
  // Handler can't be called if steps aren't set
  if (!steps.value) throw new Error('Steps are not set');

  const data = convertStepsToCallout(steps.value);

  if (!data.variants.default.title) {
    data.variants.default.title = t('createCallout.untitledCallout');
  }

  if (asDraft) {
    data.starts = null;
    data.expires = null;
  }

  const callout = props.id
    ? await updateCallout(props.id, data)
    : await createCallout(data);

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
    router.push({ path: '/admin/callouts/view/' + callout.slug });
  }
}

async function handleSaveDraft() {
  const callout = await saveCallout(true);
  addNotification({
    title: 'Saved draft',
    variant: 'success',
  });
  router.push({ path: '/admin/callouts/edit/' + callout.slug });
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
    previewWindow.location.href = `/callouts/${callout.slug}?preview`;
  }
}

async function reset() {
  const callout = props.id
    ? await fetchCallout(props.id, ['form', 'responseViewSchema', 'variants'])
    : undefined;
  steps.value = convertCalloutToSteps(callout);
  status.value = callout?.status;
}

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
