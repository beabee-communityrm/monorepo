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
      </div>

      <AppHeading class="mt-6">{{ t('contactOverview.roles') }}</AppHeading>
      <div class="relative mt-4">
        <RoleEditor
          :roles="contact.roles"
          @delete="handleDeleteRole"
          @update="handleUpdateRole"
        />
        <div
          v-if="changingRoles"
          class="absolute inset-0 flex items-center justify-center bg-primary-5/50"
        >
          <font-awesome-icon :icon="faCircleNotch" spin />
        </div>
      </div>

      <AppHeading class="mt-6">{{ t('contactOverview.about') }}</AppHeading>
      <div
        class="mb-4 text-sm text-body-80"
        v-html="t('contactOverview.annotation.copy')"
      />
      <AppForm
        :button-text="t('form.saveChanges')"
        :success-text="t('contacts.data.annotationsCopy')"
        @submit.prevent="handleFormSubmit"
      >
        <div class="mb-4">
          <AppInput
            v-model="contactAnnotations.description"
            :label="t('contacts.data.description')"
          />
        </div>
        <RichTextEditor
          v-model="contactAnnotations.notes"
          :label="t('contacts.data.notes')"
          class="mb-4"
        />
      </AppForm>
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
import { onBeforeMount, ref, reactive } from 'vue';
import {
  ContributionType,
  GetContactWith,
  type ContactRoleData,
  type ContentJoinSetupData,
  type GetCalloutDataWith,
  type GetCalloutResponseDataWith,
  type GetContactData,
  type GetContactDataWith,
  type RoleType,
} from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';
import { faCircleNotch, faMobileAlt } from '@fortawesome/free-solid-svg-icons';

import AppHeading from '@components/AppHeading.vue';
import AppInput from '@components/forms/AppInput.vue';
import AppButton from '@components/button/AppButton.vue';
import RoleEditor from '@components/role/RoleEditor.vue';
import AppInfoList from '@components/AppInfoList.vue';
import AppInfoListItem from '@components/AppInfoListItem.vue';
import RichTextEditor from '@components/rte/RichTextEditor.vue';
import AppForm from '@components/forms/AppForm.vue';
import PaymentMethod from '@components/payment-method/PaymentMethod.vue';
import AppConfirmDialog from '@components/AppConfirmDialog.vue';
import App2ColGrid from '@components/App2ColGrid.vue';
import CalloutForm from '@components/pages/callouts/CalloutForm.vue';
import ToggleTagButton from '@components/tag/ToggleTagButton.vue';
import TagList from '@components/tag/TagList.vue';

import {
  deleteRole,
  fetchContact,
  updateContact,
  updateRole,
  contactTagOperations,
  updateContacts,
} from '@utils/api/contact';
import { formatLocale } from '@utils/dates';
import { fetchContent } from '@utils/api/content';
import { fetchContactMfa, deleteContactMfa } from '@utils/api/contact-mfa';
import { CONTACT_MFA_TYPE } from '@enums/contact-mfa-type';
import { fetchCallout, fetchResponses } from '@utils/api/callout';

import { addNotification } from '@store/notifications';

import env from '@env';

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
const contactAnnotations = reactive({
  notes: '',
  description: '',
  tags: [] as string[],
});
const securityLink = ref('');
const changingRoles = ref(false);

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
    await deleteContactMfa(props.contact.id, {
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
const joinSurveyResponse = ref<GetCalloutResponseDataWith<'answers'>>();

async function handleFormSubmit() {
  await updateContact(props.contact.id, {
    profile: { ...contactAnnotations },
  });
}

async function handleSecurityAction() {
  const response = await (() => 'https://reset-link.com')();
  securityLink.value = response;
}

async function handleUpdateRole(role: ContactRoleData) {
  await handleChangedRoles(() => updateRole(props.contact.id, role.role, role));
}

async function handleDeleteRole(roleName: RoleType) {
  await handleChangedRoles(() => deleteRole(props.contact.id, roleName));
}

async function handleChangedRoles(cb: () => Promise<unknown>) {
  changingRoles.value = true;
  await cb();
  contact.value = await fetchContact(props.contact.id, [
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
    await updateContacts(
      {
        condition: 'AND',
        rules: [{ field: 'id', operator: 'equal', value: [contact.value.id] }],
      },
      { tags: [tagId] }
    );

    // Refresh contact data
    contact.value = await fetchContact(props.contact.id, [
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
  contact.value = await fetchContact(props.contact.id, [
    GetContactWith.Profile,
    GetContactWith.Contribution,
    GetContactWith.Roles,
    GetContactWith.Tags,
  ]);
  contactAnnotations.notes = contact.value.profile.notes || '';
  contactAnnotations.description = contact.value.profile.description || '';
  contactAnnotations.tags = contact.value.tags.map((tag) => tag.name);

  contactTags.value = (await fetchContent('contacts')).tags;

  // Fetch MFA information
  const contactMfa = await fetchContactMfa(props.contact.id);
  if (contactMfa && contactMfa.type === CONTACT_MFA_TYPE.TOTP) {
    mfa.value.isEnabled = true;
  }

  setupContent.value = await fetchContent('join/setup');
  const joinSurveySlug = setupContent.value.surveySlug;
  if (joinSurveySlug) {
    joinSurvey.value = await fetchCallout(joinSurveySlug, ['form']);
    const responses = await fetchResponses(
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
      ['answers']
    );
    joinSurveyResponse.value = responses.items[0];
  }

  const tags = await contactTagOperations.fetchTags();
  tagItems.value = tags.map((tag) => ({
    id: tag.id,
    label: tag.name,
  }));
});
</script>
