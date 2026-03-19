<template>
  <div
    class="mb-[53px] flex-auto overflow-y-auto overflow-x-visible lg:mb-[61px]"
  >
    <TheMenuListSection
      v-for="(section, index) in menu"
      :key="index"
      :section="section"
      :is-first="index === 0"
    />
    <div v-if="adminMenuVisible" class="mt-2 bg-primary-10 py-2">
      <TheMenuListSection
        v-for="(section, index) in adminMenu"
        :key="index"
        :section="section"
        :is-first="index === 0"
      />
      <div v-if="canAdmin && !env.cnrMode" class="px-2 lg:px-4">
        <div class="my-2 border-t border-primary-40" />
        <a href="/members" class="block text-body-80">
          <TheMenuListItem
            :icon="faWindowRestore"
            :title="t('menu.legacyApp')"
          />
        </a>
      </div>
    </div>
  </div>
  <div
    class="fixed bottom-0 left-0 w-menu bg-white px-4 py-2 md:w-16 lg:w-menu"
  >
    <a class="cursor-pointer" @click="doLogout">
      <TheMenuListItem :icon="faSignInAlt" :title="t('menu.logout')" />
    </a>
  </div>
</template>

<script lang="ts" setup>
import {
  faSignInAlt,
  faWindowRestore,
} from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { client } from '#utils/api';

import env from '../../env';
import { canAdmin } from '../../store';
import TheMenuListItem from './TheMenuListItem.vue';
import TheMenuListSection from './TheMenuListSection.vue';
import { adminMenu, menu } from './menu-list';

const { t } = useI18n();

const router = useRouter();
const doLogout = () => {
  client.auth.logout();
  router.push('/auth/login');
};

const adminMenuVisible = computed(() =>
  adminMenu.value.some((section) => section.items.some((item) => item.visible))
);
</script>
