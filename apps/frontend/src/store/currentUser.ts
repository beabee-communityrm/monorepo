import type { RoleType } from '@beabee/beabee-common';
import { computed, type ComputedRef, ref } from 'vue';

import { instance } from '@utils/api';

import { fetchContact } from '@utils/api/contact';

import type { GetContactData } from '@type';

export async function updateCurrentUser(
  contact?: GetContactData
): Promise<void> {
  try {
    currentUser.value = contact || (await fetchContact('me'));
  } catch (err) {
    currentUser.value = null;
  }
}

export const currentUser = ref<GetContactData | null>(null);
export const initCurrentUser = updateCurrentUser();

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      currentUser.value = null;
    }
    return Promise.reject(error);
  }
);

export const currentUserCan = (role: RoleType): ComputedRef<boolean> => {
  return computed(() => {
    return (
      currentUser.value != null && currentUser.value.activeRoles.includes(role)
    );
  });
};

export const canAdmin = currentUserCan('admin');
