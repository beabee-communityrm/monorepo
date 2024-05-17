<template>
  <SectionTitle>{{ t('homePage.quickActions') }}</SectionTitle>

  <ul class="mt-4 list-disc space-y-2 pl-4 font-semibold underline">
    <!--<li>
      <router-link to="/profile/edit">
        {{ t('homePage.editProfile') }}
      </router-link>
    </li>-->
    <li>
      <router-link to="/callouts">
        {{ t('homePage.viewOpenCallouts') }}
      </router-link>
    </li>
    <li v-if="!generalContent.hideContribution">
      <router-link to="/profile/contribution">
        {{ t('homePage.manageContribution') }}
      </router-link>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import SectionTitle from './SectionTitle.vue';
import { useI18n } from 'vue-i18n';
import { generalContent } from '../../../store';

const { t } = useI18n();
</script>
