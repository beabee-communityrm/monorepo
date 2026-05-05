<template>
  <div
    class="mb-13.25 flex-auto overflow-x-visible overflow-y-auto lg:mb-15.25"
  >
    <TheMenuListSection
      v-for="(section, index) in menu"
      :key="index"
      :section="section"
      :is-first="index === 0"
    />
    <div v-if="adminMenuVisible" class="bg-primary-10 mt-2 py-2">
      <TheMenuListSection
        v-for="(section, index) in adminMenu"
        :key="index"
        :section="section"
        :is-first="index === 0"
      />
      <div v-if="canAdmin && !env.cnrMode" class="px-2 lg:px-4">
        <div class="border-primary-40 my-2 border-t" />
        <a href="/members" class="text-body-80 block">
          <TheMenuListItem
            :icon="faWindowRestore"
            :title="t('menu.legacyApp')"
          />
        </a>
      </div>
    </div>
  </div>
  <div
    class="w-menu lg:w-menu fixed bottom-0 left-0 bg-white px-4 py-2 md:w-16"
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
