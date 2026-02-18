<route lang="yaml">
name: adminContactsViewOverview
meta:
  pageTitle: menu.contacts
  role: admin
</route>

<template>
  <App2ColGrid v-if="contact" extended>
    <template #col1>
      <AppHeading>{{ t('contactOverview.overview') }}</AppHeading>

      <!-- Tags -->
      <TagList
        v-if="contact.tags.length > 0"
        :tags="contact.tags"
        class="mb-4"
        @select="(tagId) => $router.push(`/admin/contacts?tag=${tagId}`)"
      />

      <AppInfoList class="mb-4">
        <AppInfoListItem
          :name="t('contacts.data.joined')"
          :value="formatLocale(contact.joined, 'PPP')"
        />
        <AppInfoListItem
          :name="t('contacts.data.lastSeen')"
          :value="
            contact.lastSeen ? formatLocale(contact.lastSeen, 'PPP') : '–'
          "
        />
      </AppInfoList>

      <div class="mb-4 flex gap-2">
        <ToggleTagButton
          size="sm"
          with-text
          :tag-items="tagItems"
          :selected-tags="contact.tags.map((t) => t.id)"
          :manage-url="'/admin/contacts/tags'"
          :loading="changingTags"
          @toggle="handleToggleTag"
        />
      </div>

      <div v-if="!env.cnrMode">
        <AppHeading class="mt-6">
          {{ t('contactOverview.contribution') }}
        </AppHeading>
        <AppSubHeading class="mb-1">
          {{ t('contactOverview.recurring') }}
        </AppSubHeading>
        <AppInfoList>
          <AppInfoListItem
            :name="t('contacts.data.amount')"
            :value="
              contact.contributionAmount
                ? n(contact.contributionAmount, 'currency')
                : '–'
            "
          />
          <AppInfoListItem
            :name="t('contacts.data.period')"
            :value="
              contact.contributionPeriod &&
              t('common.contributionPeriod.' + contact.contributionPeriod)
            "
          />
          <AppInfoListItem
            v-if="contact.contribution.type === ContributionType.Automatic"
            :name="t('contacts.data.payingFee')"
            :value="
              contact.contribution.payFee ? t('common.yes') : t('common.no')
            "
          />
          <AppInfoListItem
            :name="t('contactOverview.contributionType')"
            :value="contact.contribution.type"
          />
          <AppInfoListItem
            v-if="contact.contribution.paymentSource?.method"
            :name="t('contribution.paymentMethod')"
          >
            <PaymentMethod :source="contact.contribution.paymentSource" />
          </AppInfoListItem>
          <AppInfoListItem
            v-if="contact.contribution.cancellationDate"
            :name="t('contactOverview.cancellationDate')"
            :value="formatLocale(contact.contribution.cancellationDate, 'PPP')"
          />
        </AppInfoList>
        <template v-if="generalContent.enableOneTimeDonations">
          <AppSubHeading class="mb-1">
            {{ t('contactOverview.oneTime') }}
          </AppSubHeading>
          <AppInfoList>
            <AppInfoListItem
              :name="t('paymentsAdmin.aggregation.total')"
              :value="
                paymentAggregations?.sum
                  ? n(paymentAggregations?.sum, 'currency')
                  : '–'
              "
            />
            <AppInfoListItem
              :name="t('paymentsAdmin.aggregation.average')"
              :value="
                paymentAggregations?.average
                  ? n(paymentAggregations?.average, 'currency')
                  : '–'
              "
            />
          </AppInfoList>
        </template>
      </div>

      <AppHeading class="mt-6">{{ t('contactOverview.roles') }}</AppHeading>
      <div class="relative mt-4">
        <AppRoleEditor
          :roles="contact.roles"
          @delete="handleDeleteRole"
          @update="handleUpdateRole"
        />
        <div
          v-if="changingRoles"
          class="absolute inset-0 flex items-center justify-center bg-primary-5/50"
        >
          <AppLoadingSpinner />
        </div>
      </div>

      <AppHeading class="mt-6">{{ t('contactOverview.about') }}</AppHeading>
      <div
        class="mb-4 text-sm text-body-80"
        v-html="t('contactOverview.annotation.copy')"
      />
      <AppApiForm
        :button-text="t('form.saveChanges')"
        :success-text="t('contacts.data.annotationsCopy')"
        @submit.prevent="handleUpdateAbout"
      >
        <div class="mb-4">
          <AppInput
            v-model="contactAbout.description"
            :label="t('contacts.data.description')"
          />
        </div>
        <AppRichTextEditor
          v-model="contactAbout.notes"
          :label="t('contacts.data.notes')"
          class="mb-4"
        />
      </AppApiForm>
    </template>
    <template #col2>
      <section class="mb-6">
        <AppHeading>{{ t('contactOverview.profile') }}</AppHeading>
        <AppInfoList>
          <AppInfoListItem
            :name="t('contacts.data.preferredChannel')"
            :value="contact.profile.preferredContact"
          />
          <AppInfoListItem
            :name="t('contacts.data.email')"
            :value="contact.email"
          />
          <AppInfoListItem
            :name="t('contacts.data.phone')"
            :value="contact.profile.telephone"
          />
          <AppInfoListItem
            :name="t('contacts.data.deliveryOptIn')"
            :value="
              contact.profile.deliveryOptIn ? t('common.yes') : t('common.no')
            "
          />
        </AppInfoList>
      </section>

      <section class="mb-6">
        <AppHeading>{{ t('contactOverview.newsletter.title') }}</AppHeading>
        <AppInfoList>
          <AppInfoListItem
            :name="t('contactOverview.newsletter.status')"
            :value="
              t('common.newsletterStatus.' + contact.profile.newsletterStatus)
            "
          />
          <AppInfoListItem
            :name="t('contactOverview.newsletter.groups')"
            :value="
              contact.profile.newsletterGroups
                .map(
                  (id) =>
                    setupContent?.newsletterGroups.find(
                      (group) => group.id === id
                    )?.label || id
                )
                .join(', ')
            "
          />
        </AppInfoList>
      </section>

      <!-- Security -->
      <section class="mb-6">
        <AppHeading>{{ t('contactOverview.security.title') }}</AppHeading>

        <!-- Multi factor authentication -->
        <section v-if="mfa.isEnabled" class="mt-4">
          <p>
            {{
              t('contactOverview.security.mfa.desc', {
                disableLabel: t('actions.disable'),
              })
            }}
          </p>

          <AppButton
            type="button"
            variant="primaryOutlined"
            class="mt-4"
            :icon="faMobileAlt"
            @click="mfa.showDisableConfirmModal = true"
          >
            {{ t(`actions.disable`) }}
          </AppButton>
        </section>

        <section v-else class="mt-4">
          <p>
            {{ t('contactOverview.security.mfa.disabledDesc') }}
          </p>
        </section>

        <!-- Not implemented yet -->
        <section class="mt-4 hidden">
          <p>{{ t('contactOverview.security.whatDoTheButtonsDo') }}</p>
          <form @submit.prevent="handleSecurityAction">
            <AppButton type="submit" variant="primaryOutlined" class="mt-4">{{
              t('contactOverview.security.loginOverride')
            }}</AppButton>
            <AppButton
              type="submit"
              variant="primaryOutlined"
              class="ml-6 mt-2"
              >{{ t('contactOverview.security.resetPassword') }}</AppButton
            >
          </form>
          <div v-if="securityLink" class="mt-4">
            <p class="mt-4">{{ t('contactOverview.security.instructions') }}</p>
            <AppInput readonly :value="securityLink" class="mt-2"></AppInput>
          </div>
        </section>
      </section>

      <section v-if="joinSurvey && joinSurveyResponse" class="mb-6">
        <AppHeading>
          {{ t('contactOverview.joinSurvey') }}
        </AppHeading>
        <CalloutForm
          :callout="joinSurvey"
          :answers="joinSurveyResponse.answers"
          :style="'small'"
          all-slides
          readonly
        />
      </section>
    </template>
  </App2ColGrid>

  <AppConfirmDialog
    :open="mfa.showDisableConfirmModal"
    :title="t('accountPage.mfa.confirmDelete.title')"
    :cancel="t('actions.noBack')"
    :confirm="t('actions.yesDisable')"
    variant="danger"
    @close="mfa.showDisableConfirmModal = false"
    @confirm="disableMfaAndNotify"
  >
    <p>{{ t('accountPage.mfa.confirmDelete.desc') }}</p>
  </AppConfirmDialog>
</template>

<script lang="ts" setup>
import {
  CONTACT_MFA_TYPE,
  type ContactRoleData,
  type ContentJoinSetupData,
  ContributionType,
  type GetCalloutDataWith,
  type GetCalloutResponseDataWith,
  GetCalloutResponseWith,
  type GetContactData,
  type GetContactDataWith,
  GetContactWith,
  type GetPaymentAggregationData,
  type RoleType,
} from '@beabee/beabee-common';
import {
  App2ColGrid,
  AppButton,
  AppConfirmDialog,
  AppHeading,
  AppInfoList,
  AppInfoListItem,
  AppInput,
  AppLoadingSpinner,
  AppRichTextEditor,
  AppSubHeading,
  formatLocale,
} from '@beabee/vue';
import { addNotification } from '@beabee/vue/store/notifications';

import AppApiForm from '@components/forms/AppApiForm.vue';
import CalloutForm from '@components/pages/callouts/CalloutForm.vue';
import { PaymentMethod } from '@components/payment';
import AppRoleEditor from '@components/role/AppRoleEditor.vue';
import TagList from '@components/tag/TagList.vue';
import ToggleTagButton from '@components/tag/ToggleTagButton.vue';
import env from '@env';
import { faMobileAlt } from '@fortawesome/free-solid-svg-icons';
import { generalContent } from '@store/generalContent';
import { client } from '@utils/api';
import { onBeforeMount, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, n } = useI18n();

const props = defineProps<{
  contact: GetContactData;
}>();

// TODO: remove this when we rework how the contact is passed to child pages
// eslint-disable-next-line vue/no-dupe-keys
const contact = ref<GetContactDataWith<
  | GetContactWith.Profile
  | GetContactWith.Contribution
  | GetContactWith.Roles
  | GetContactWith.Tags
> | null>(null);
const contactTags = ref<string[]>([]);
const contactAbout = reactive({ notes: '', description: '' });
const securityLink = ref('');
const changingRoles = ref(false);

const paymentAggregations = ref<GetPaymentAggregationData>();

/** Multi factor authentication state */
const mfa = ref({
  showDisableConfirmModal: false,
  isEnabled: false,
});

/** Disable MFA and notify the admin */
const disableMfaAndNotify = async () => {
  mfa.value.showDisableConfirmModal = false;
  await disableMfa();
  addNotification({
    title: t('accountPage.mfa.disabledNotification'),
    variant: 'warning',
  });
};

/** Disable MFA for the contact by the admin */
const disableMfa = async () => {
  try {
    await client.contact.mfa.delete(props.contact.id, {
      type: CONTACT_MFA_TYPE.TOTP,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_err) {
    onDeleteMfaError();
    return false;
  }

  mfa.value.isEnabled = false;

  return true;
};

const onDeleteMfaError = () => {
  addNotification({
    title: t('accountPage.mfa.deleteUnknownErrorNotification'),
    variant: 'error',
  });
};

const joinSurvey = ref<GetCalloutDataWith<'form'>>();
const joinSurveyResponse =
  ref<GetCalloutResponseDataWith<GetCalloutResponseWith.Answers>>();

async function handleUpdateAbout() {
  await client.contact.update(props.contact.id, { profile: contactAbout });
}

async function handleSecurityAction() {
  const response = await (() => 'https://reset-link.com')();
  securityLink.value = response;
}

async function handleUpdateRole(roleName: RoleType, role: ContactRoleData) {
  await handleChangedRoles(() =>
    client.contact.role.update(props.contact.id, roleName, role)
  );
}

async function handleDeleteRole(roleName: RoleType) {
  await handleChangedRoles(() =>
    client.contact.role.delete(props.contact.id, roleName)
  );
}

async function handleChangedRoles(cb: () => Promise<unknown>) {
  changingRoles.value = true;
  await cb();
  contact.value = await client.contact.get(props.contact.id, [
    GetContactWith.Profile,
    GetContactWith.Contribution,
    GetContactWith.Roles,
    GetContactWith.Tags,
  ]);
  changingRoles.value = false;
}

const setupContent = ref<ContentJoinSetupData>();

const changingTags = ref(false);
const tagItems = ref<{ id: string; label: string }[]>([]);

async function handleToggleTag(tagId: string, successText: string) {
  if (!contact.value) return;

  changingTags.value = true;
  try {
    await client.contact.updateMany(
      {
        condition: 'AND',
        rules: [{ field: 'id', operator: 'equal', value: [contact.value.id] }],
      },
      { tags: [tagId] }
    );

    // Refresh contact data
    contact.value = await client.contact.get(props.contact.id, [
      GetContactWith.Profile,
      GetContactWith.Contribution,
      GetContactWith.Roles,
      GetContactWith.Tags,
    ]);

    addNotification({ title: successText, variant: 'success' });
  } finally {
    changingTags.value = false;
  }
}

onBeforeMount(async () => {
  contact.value = await client.contact.get(props.contact.id, [
    GetContactWith.Profile,
    GetContactWith.Contribution,
    GetContactWith.Roles,
    GetContactWith.Tags,
  ]);
  contactAbout.notes = contact.value.profile.notes || '';
  contactAbout.description = contact.value.profile.description || '';

  contactTags.value = (await client.content.get('contacts')).tags;

  paymentAggregations.value = await client.payment.aggregate({
    rules: {
      condition: 'AND',
      rules: [
        {
          field: 'contact',
          operator: 'equal',
          value: [props.contact.id],
        },
        {
          field: 'type',
          operator: 'equal',
          value: ['one-time'],
        },
      ],
    },
  });

  // Fetch MFA information
  const contactMfa = await client.contact.mfa.get(props.contact.id);
  if (contactMfa && contactMfa.type === CONTACT_MFA_TYPE.TOTP) {
    mfa.value.isEnabled = true;
  }

  setupContent.value = await client.content.get('join/setup');

  const joinSurveySlug = setupContent.value.surveySlug;
  if (joinSurveySlug) {
    joinSurvey.value = await client.callout.get(joinSurveySlug, ['form']);
    const responses = await client.callout.listResponses(
      joinSurveySlug,
      {
        limit: 1,
        order: 'DESC',
        sort: 'createdAt',
        rules: {
          condition: 'AND',
          rules: [
            { field: 'contact', operator: 'equal', value: [props.contact.id] },
          ],
        },
      },
      [GetCalloutResponseWith.Answers]
    );
    joinSurveyResponse.value = responses.items[0];
  }

  const tags = await client.contact.tag.list();
  tagItems.value = tags.map((tag) => ({
    id: tag.id,
    label: tag.name,
  }));
});
</script>
