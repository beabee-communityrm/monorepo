<!--
  # LoginMethods
  Lists every login method with one action each: methods the member has can
  be removed (the password only changed), the others set up. Setting up runs
  as a login action at the identity provider. Removal needs a login there
  from the last two hours: when the API asks for one, the member is sent to
  log in again and comes back here with the method to remove in the query.
-->

<template>
  <AppHeading>{{ t('accountPage.selfService.methods.title') }}</AppHeading>
  <p class="mb-2 text-sm text-main-80">
    {{ t('accountPage.selfService.methods.description') }}
  </p>
  <ul v-if="methods" class="divide-primary-20 mb-6 divide-y">
    <template v-for="type in CONTACT_AUTH_METHOD_TYPES" :key="type">
      <li
        v-for="method in methods.filter((m) => m.type === type)"
        :key="method.id"
        class="flex items-center gap-3 py-2"
      >
        <font-awesome-icon
          :icon="METHOD_ICONS[type]"
          class="text-primary-70 w-5"
        />
        <div class="min-w-0 flex-1">
          <p class="font-semibold">
            {{ t(`accountPage.selfService.methods.${type}`) }}
          </p>
          <p v-if="method.name" class="truncate text-sm text-body-80">
            {{ method.name }}
          </p>
        </div>
        <AppButton
          v-if="type === 'password'"
          :href="loginActionUrl('changePassword')"
          variant="primaryOutlined"
          size="sm"
        >
          {{ t('accountPage.selfService.methods.change') }}
        </AppButton>
        <AppButton
          v-else
          variant="dangerOutlined"
          size="sm"
          @click="methodToRemove = method"
        >
          {{ t('actions.delete') }}
        </AppButton>
      </li>
      <!-- A member can have several passkeys, so adding one stays available -->
      <li
        v-if="
          SETUP_ACTIONS[type] &&
          (type === 'passkey' || !methods.some((m) => m.type === type))
        "
        class="flex items-center gap-3 py-2"
      >
        <font-awesome-icon
          :icon="METHOD_ICONS[type]"
          class="text-primary-70 w-5 opacity-50"
        />
        <div class="min-w-0 flex-1">
          <p class="font-semibold">
            {{ t(`accountPage.selfService.methods.${type}`) }}
          </p>
          <p class="text-sm text-body-80">
            {{
              methods.some((m) => m.type === type)
                ? t('accountPage.selfService.methods.anotherPasskey')
                : t('accountPage.selfService.methods.notSetUp')
            }}
          </p>
        </div>
        <AppButton
          :href="loginActionUrl(SETUP_ACTIONS[type])"
          variant="primaryOutlined"
          size="sm"
        >
          {{
            type === 'passkey'
              ? t('actions.add')
              : t('accountPage.selfService.methods.setUp')
          }}
        </AppButton>
      </li>
    </template>
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
  CONTACT_AUTH_METHOD_TYPES,
  type ContactAuthMethodType,
  type GetContactAuthMethodData,
  LOGIN_CODES,
  type LoginAction,
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

// Security keys have no login action, so they can only be removed here
const SETUP_ACTIONS: Partial<Record<ContactAuthMethodType, LoginAction>> = {
  password: 'changePassword',
  passkey: 'addPasskey',
  authenticatorApp: 'setupMfa',
};

// Each action runs at the identity provider inside a login that returns here
const loginActionUrl = (action: LoginAction | undefined) =>
  client.auth.getLoginUrl('/profile/account', action);

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const methods = ref<GetContactAuthMethodData[]>();
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
