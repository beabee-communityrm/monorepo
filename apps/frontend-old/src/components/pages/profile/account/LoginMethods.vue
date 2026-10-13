<!--
  # LoginMethods
  Lists the member's login methods at the identity provider and removes one
  on request. Removal needs a login at the identity provider from the last
  few minutes: when the API asks for one, the member is sent to log in again
  and comes back here with the method to remove in the query.
-->

<template>
  <AppHeading>{{ t('accountPage.selfService.methods.title') }}</AppHeading>
  <p class="mb-2 text-sm text-main-80">
    {{ t('accountPage.selfService.methods.description') }}
  </p>
  <ul class="divide-primary-20 mb-6 divide-y">
    <li
      v-for="method in methods"
      :key="method.id"
      class="flex items-center gap-3 py-2"
    >
      <font-awesome-icon
        :icon="METHOD_ICONS[method.type]"
        class="text-primary-70 w-5"
      />
      <div class="min-w-0 flex-1">
        <p class="font-semibold">
          {{ t(`accountPage.selfService.methods.${method.type}`) }}
        </p>
        <p v-if="method.name" class="truncate text-sm text-body-80">
          {{ method.name }}
        </p>
      </div>
      <AppButton
        v-if="method.type !== 'password'"
        variant="dangerOutlined"
        size="sm"
        @click="methodToRemove = method"
      >
        {{ t('actions.delete') }}
      </AppButton>
    </li>
  </ul>

  <AppConfirmDialog
    :open="!!methodToRemove"
    :title="t('accountPage.selfService.methods.confirmRemove.title')"
    :cancel="t('actions.cancel')"
    :confirm="t('actions.yesRemove')"
    variant="danger"
    @close="methodToRemove = undefined"
    @confirm="methodToRemove && remove(methodToRemove.id)"
  >
    <p>{{ t('accountPage.selfService.methods.confirmRemove.desc') }}</p>
  </AppConfirmDialog>
</template>

<script lang="ts" setup>
import {
  type ContactAuthMethodType,
  type GetContactAuthMethodData,
  LOGIN_CODES,
} from '@beabee/beabee-common';
import { UnauthorizedError } from '@beabee/client';
import {
  AppButton,
  AppConfirmDialog,
  AppHeading,
  addNotification,
} from '@beabee/vue';

import {
  type IconDefinition,
  faFingerprint,
  faKey,
  faMobileScreen,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { client } from '#utils/api';

const METHOD_ICONS: Record<ContactAuthMethodType, IconDefinition> = {
  password: faKey,
  passkey: faFingerprint,
  authenticatorApp: faMobileScreen,
  securityKey: faShieldHalved,
};

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const methods = ref<GetContactAuthMethodData[]>([]);
const methodToRemove = ref<GetContactAuthMethodData>();

async function load() {
  methods.value = await client.contact.authMethod.list('me');
}

async function remove(id: string, loginAgain = true) {
  try {
    await client.contact.authMethod.delete('me', id);
    methodToRemove.value = undefined;
    addNotification({
      variant: 'success',
      title: t('accountPage.selfService.methods.removed'),
    });
    await load();
  } catch (err) {
    if (
      loginAgain &&
      err instanceof UnauthorizedError &&
      err.code === LOGIN_CODES.FRESH_LOGIN_REQUIRED
    ) {
      window.location.href = client.auth.getLoginUrl(
        `/profile/account?removeAuthMethod=${id}`,
        undefined,
        'login'
      );
      return;
    }
    throw err;
  }
}

onBeforeMount(async () => {
  await load();
  // Back from the fresh login: finish what the member confirmed before it
  const id = route.query.removeAuthMethod;
  if (typeof id === 'string') {
    router.replace({ query: { ...route.query, removeAuthMethod: undefined } });
    await remove(id, false);
  }
});
</script>
