import {
  type GetContactDataWith,
  GetContactWith,
  type RoleType,
} from '@beabee/beabee-common';

import { type ComputedRef, computed, ref } from 'vue';

import { client } from '#utils/api';

export async function updateCurrentUser(): Promise<void> {
  try {
    currentUser.value = await client.contact.get('me', [
      GetContactWith.IsReviewer,
    ]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_err) {
    currentUser.value = null;
  }
}

export const currentUser =
  ref<GetContactDataWith<GetContactWith.IsReviewer> | null>(null);

export const initCurrentUser = async () => {
  if (currentUser.value !== null) {
    return;
  }
  await updateCurrentUser();
  client.fetch.onError((error) => {
    if (error.httpCode === 401) {
      currentUser.value = null;
    }
  });
};

export const currentUserCan = (role: RoleType): ComputedRef<boolean> => {
  return computed(() => {
    return (
      currentUser.value != null && currentUser.value.activeRoles.includes(role)
    );
  });
};

export const canAdmin = currentUserCan('admin');
