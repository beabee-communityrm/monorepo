<template>
  <nav class="px-2 text-body-80 lg:px-4">
    <div v-if="!isFirst" class="my-2 border-t border-primary-40" />
    <div v-if="section.title" class="pb-2 md:hidden lg:inline-block">
      {{ t(section.title) }}
    </div>
    <ul class="flex flex-col">
      <template v-for="item in section.items" :key="item.href">
        <li>
          <router-link :to="item.href">
            <TheMenuListItem
              :icon="item.icon"
              :title="t(item.title)"
              :is-active="
                item.isActive
                  ? item.isActive.test(route.path)
                  : item.href === route.path
              "
            />
          </router-link>
        </li>
      </template>
    </ul>
  </nav>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import type { MenuSection } from './menu-list.interface';
import TheMenuListItem from './TheMenuListItem.vue';

defineProps<{
  section: MenuSection;
  isFirst: boolean;
}>();

const { t } = useI18n();

const route = useRoute();
</script>
