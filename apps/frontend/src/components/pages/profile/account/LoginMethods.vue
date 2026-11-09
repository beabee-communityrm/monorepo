<!--
  # LoginMethods
  Lists every login method with one action each: methods the member has can
  be removed (the password only changed), the others set up. Setting up runs
  as a login action at the identity provider. Removal needs a login there
  from the last two hours: when the API asks for one, the member is sent to
  log in again and comes back here with the method to remove in the query.
-->

<template>
  <AppSectionCard
    icon="i-lucide-shield-check"
    :title="t('accountPage.selfService.methods.title')"
    :description="t('accountPage.selfService.methods.description')"
  >
    <ul v-if="methods" class="divide-y divide-default">
      <template v-for="type in CONTACT_AUTH_METHOD_TYPES" :key="type">
        <li
          v-for="method in methods.filter((m) => m.type === type)"
          :key="method.id"
          class="flex items-center gap-3 py-3"
        >
          <UIcon
            :name="METHOD_ICONS[type]"
            class="size-5 shrink-0 text-muted"
          />
          <div class="min-w-0 flex-1">
            <p class="font-medium">
              {{ t(`accountPage.selfService.methods.${type}`) }}
            </p>
            <p v-if="method.name" class="truncate text-muted">
              {{ method.name }}
            </p>
          </div>
          <UButton
            v-if="type === 'password'"
            :to="loginActionUrl('changePassword')"
            external
            variant="ghost"
            size="sm"
            icon="i-lucide-pencil"
          >
            {{ t('accountPage.selfService.methods.change') }}
          </UButton>
          <UButton
            v-else
            variant="ghost"
            color="error"
            size="sm"
            icon="i-lucide-trash-2"
            @click="methodToRemove = method"
          >
            {{ t('actions.delete') }}
          </UButton>
        </li>
        <!-- A member can have several passkeys, so adding one stays available -->
        <li
          v-if="
            SETUP_ACTIONS[type] &&
            (type === 'passkey' || !methods.some((m) => m.type === type))
          "
          class="flex items-center gap-3 py-3"
        >
          <UIcon
            :name="METHOD_ICONS[type]"
            class="size-5 shrink-0 text-dimmed"
          />
          <div class="min-w-0 flex-1">
            <p class="font-medium">
              {{ t(`accountPage.selfService.methods.${type}`) }}
            </p>
            <p class="text-muted">
              {{
                methods.some((m) => m.type === type)
                  ? t('accountPage.selfService.methods.anotherPasskey')
                  : t('accountPage.selfService.methods.notSetUp')
              }}
            </p>
          </div>
          <UButton
            :to="loginActionUrl(SETUP_ACTIONS[type])"
            external
            variant="ghost"
            size="sm"
            icon="i-lucide-plus"
          >
            {{
              type === 'passkey'
                ? t('actions.add')
                : t('accountPage.selfService.methods.setUp')
            }}
          </UButton>
        </li>
      </template>
    </ul>
  </AppSectionCard>

  <UModal
    :open="!!methodToRemove"
    :ui="{ header: 'min-h-[3rem]', close: 'top-2' }"
    @update:open="(open: boolean) => !open && (methodToRemove = undefined)"
  >
    <template #body>
      <div class="flex flex-col gap-6">
        <div class="space-y-2">
          <h2>
            {{ t('accountPage.selfService.methods.confirmRemove.title') }}
          </h2>
          <p class="text-muted">
            {{ t('accountPage.selfService.methods.confirmRemove.desc') }}
          </p>
        </div>
        <AppModalActions
          :cancel-label="t('actions.cancel')"
          :confirm-label="t('actions.yesRemove')"
          confirm-color="error"
          :confirm-loading="removing"
          @cancel="methodToRemove = undefined"
          @confirm="methodToRemove && remove(methodToRemove.id)"
        />
      </div>
    </template>
  </UModal>
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
import { AppModalActions, AppSectionCard, addNotification } from '@beabee/vue';

import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { client } from '#utils/api';

const METHOD_ICONS: Record<ContactAuthMethodType, string> = {
  password: 'i-lucide-key-round',
  passkey: 'i-lucide-fingerprint',
  authenticatorApp: 'i-lucide-smartphone',
  securityKey: 'i-lucide-usb',
};

// Security keys have no login action, so they can only be removed here
const SETUP_ACTIONS: Partial<Record<ContactAuthMethodType, LoginAction>> = {
  password: 'changePassword',
  passkey: 'addPasskey',
  authenticatorApp: 'setupMfa',
};

// Each action runs at the identity provider inside a login that returns to
// the security tab
const loginActionUrl = (action: LoginAction | undefined) =>
  client.auth.getLoginUrl('/profile/account?tab=security', action);

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const methods = ref<GetContactAuthMethodData[]>();
const methodToRemove = ref<GetContactAuthMethodData>();
const removing = ref(false);

async function load() {
  methods.value = await client.contact.authMethod.list('me');
}

async function remove(id: string, loginAgain = true) {
  removing.value = true;
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
        `/profile/account?tab=security&removeAuthMethod=${id}`,
        undefined,
        'login'
      );
      return;
    }
    throw err;
  } finally {
    removing.value = false;
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
