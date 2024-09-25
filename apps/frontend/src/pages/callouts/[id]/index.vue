<route lang="yaml">
name: callout
meta:
  pageTitle: menu.callouts
  noAuth: true
  embeddable: true
</route>

<template>
  <CalloutVariantsBox :callout="callout" />

  <AppTitle v-if="!isEmbed" big>{{ callout.title }}</AppTitle>

  <template v-if="responses /* Avoids layout thrashing */">
    <CalloutThanksBox v-if="latestResponse" :callout="callout" class="mb-6" />
    <AppMessageBox
      v-else-if="!isOpen && callout.expires /* Type narrowing */"
      :title="
        t('callout.ended', { date: formatLocale(callout.expires, 'PPP') })
      "
      :icon="faInfoCircle"
      class="mb-6"
      variant="info"
    />

    <div class="flex flex-col gap-6 md:max-w-2xl">
      <CalloutIntroBox v-if="!isRespondPage" :callout="callout" />

      <CalloutLoginPrompt v-if="showLoginPrompt" />
      <CalloutMemberOnlyPrompt v-else-if="showMemberOnlyPrompt && !isPreview" />
      <div v-else-if="canRespond || latestResponse">
        <AppButton
          v-if="canRespond && !isRespondPage"
          class="w-full"
          :to="{
            path: '/callouts/' + callout.slug + '/respond',
            query: route.query,
          }"
        >
          {{
            latestResponse
              ? t('callout.actions.updateResponse')
              : t('actions.getStarted')
          }}
        </AppButton>

        <template v-else>
          <AppNotification
            v-if="isPreview"
            variant="warning"
            :title="t('callout.showingPreview')"
            class="mb-4"
          />

          <AppHeading v-if="latestResponse" class="mt-6">
            {{ t('callout.yourResponse') }}
          </AppHeading>

          <CalloutForm
            :callout="callout"
            :answers="latestResponse?.answers"
            :preview="isPreview"
            :readonly="!canRespond"
            :all-slides="!canRespond"
            :no-bg="isEmbed"
            @submitted="handleSubmitResponse"
          />
        </template>
      </div>
    </div>
  </template>
</template>
<script lang="ts" setup>
import type {
  GetCalloutDataWith,
  GetCalloutResponseDataWith,
  Paginated,
} from '@beabee/beabee-common';
import { computed, onBeforeMount, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { faBullhorn, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import AppButton from '@components/button/AppButton.vue';
import AppNotification from '@components/AppNotification.vue';
import CalloutForm from '@components/pages/callouts/CalloutForm.vue';
import { useCallout } from '@components/pages/callouts/use-callout';
import CalloutLoginPrompt from '@components/pages/callouts/CalloutLoginPrompt.vue';
import CalloutMemberOnlyPrompt from '@components/pages/callouts/CalloutMemberOnlyPrompt.vue';
import CalloutThanksBox from '@components/pages/callouts/CalloutThanksBox.vue';
import AppMessageBox from '@components/AppMessageBox.vue';
import AppHeading from '@components/AppHeading.vue';
import AppTitle from '@components/AppTitle.vue';

import { fetchResponses } from '@utils/api/callout';
import { formatLocale } from '@utils/dates';

import { currentUser, canAdmin, isEmbed } from '@store';
import { addNotification } from '@store/notifications';
import { addBreadcrumb } from '@store/breadcrumb';

import CalloutIntroBox from '@components/pages/callouts/CalloutIntroBox.vue';
import CalloutVariantsBox from '@components/pages/callouts/CalloutVariantsBox.vue';

const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'variantNames'>;
  respond?: boolean; // Flag for /respond route
  // Suppress the warning about the ID prop being passed by the router
  id?: string;
}>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

addBreadcrumb(
  computed(() =>
    currentUser.value
      ? isPreview.value
        ? [
            {
              title: t('menu.callouts'),
              to: '/admin/callouts',
              icon: faBullhorn,
            },
            {
              title: props.callout.title,
              to: '/admin/callouts/view/' + props.callout.slug,
            },
            { title: t('actions.preview') },
          ]
        : [
            {
              title: t('menu.callouts'),
              to: '/callouts',
              icon: faBullhorn,
            },
            {
              title: props.callout.title,
              to: '/callouts/' + props.callout.slug,
            },
            ...(props.respond ? [{ title: t('actions.respond') }] : []),
          ]
      : []
  )
);

const isPreview = computed(
  () => route.query.preview === null && canAdmin.value
);
const isRespondPage = computed(() => isEmbed || props.respond);

const { isOpen, showLoginPrompt, showMemberOnlyPrompt } = useCallout(
  toRef(props, 'callout')
);

const responses = ref<Paginated<GetCalloutResponseDataWith<'answers'>>>();
const latestResponse = computed(() =>
  props.callout.allowMultiple ? undefined : responses.value?.items?.[0]
);

const canRespond = computed(
  () =>
    // Preview mode
    isPreview.value ||
    // Callout is open and current user has access
    (isOpen.value &&
      !showLoginPrompt.value &&
      !showMemberOnlyPrompt.value &&
      // Current user hasn't responded or can update
      (!latestResponse.value || props.callout.allowUpdate))
);

function handleSubmitResponse() {
  if (props.callout.thanksRedirect) {
    window.location.href = props.callout.thanksRedirect;
  } else {
    router.push({
      path: `/callouts/${props.callout.slug}/thanks`,
      query: route.query,
    });
  }

  addNotification({
    title: t('callout.responseSubmitted'),
    variant: 'success',
  });
}

onBeforeMount(async () => {
  responses.value =
    !isPreview.value && currentUser.value
      ? await fetchResponses(
          props.callout.slug,
          {
            rules: {
              condition: 'AND',
              rules: [{ field: 'contact', operator: 'equal', value: ['me'] }],
            },
            sort: 'createdAt',
            order: 'DESC',
          },
          ['answers']
        )
      : { total: 0, count: 0, offset: 0, items: [] };
});
</script>
