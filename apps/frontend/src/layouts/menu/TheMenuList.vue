<template>
  <div class="flex-auto">
    <TheMenuListSection
      v-for="(section, index) in menu"
      :key="index"
      :section="section"
      :is-first="index === 0"
    />
    <div v-if="canAdmin" class="mt-2 bg-primary-10 py-2">
      <TheMenuListSection
        v-for="(section, index) in adminMenu"
        :key="index"
        :section="section"
        :is-first="index === 0"
      />
      <div v-if="!env.cnrMode" class="px-2 lg:px-4">
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
    class="fixed bottom-0 left-0 w-menu border-t border-primary-40 bg-white px-1 py-2 md:w-16 lg:w-menu"
  >
    <a class="cursor-pointer" @click="doLogout">
      <TheMenuListItem :icon="faSignInAlt" :title="t('menu.logout')" />
    </a>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import TheMenuListItem from './TheMenuListItem.vue';
import TheMenuListSection from './TheMenuListSection.vue';
import { canAdmin } from '../../store';
import { logout } from '../../utils/api/auth';
import env from '../../env';

import { menu, adminMenu } from './menu-list';
import {
  faSignInAlt,
  faWindowRestore,
} from '@fortawesome/free-solid-svg-icons';

const { t } = useI18n();

const router = useRouter();
const doLogout = () => {
  logout();
  router.push('/auth/login');
};
</script>
