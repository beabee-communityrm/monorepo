<template>
  <header
    class="z-10 flex flex-wrap items-center justify-end gap-2 p-4 shadow-lg md:p-6"
  >
    <AppTitle
      :title="callout.title"
      light
      no-margin
      class="w-full md:w-auto md:flex-1"
    >
      {{ callout.title }}
    </AppTitle>

    <AppDropdownButton
      v-if="variantItems.length > 1"
      :icon="faGlobe"
      variant="greyOutlined"
      :title="variantItems.find((vi) => vi.id === currentVariant)?.label || ''"
      show-title
    >
      <AppSelectableList
        v-slot="{ item }"
        :items="variantItems"
        @click="currentVariant = $event.id"
      >
        <font-awesome-icon :icon="faGlobe" class="mr-2" />{{ item.label }}
      </AppSelectableList>
    </AppDropdownButton>

    <AppButton
      v-if="viewLink"
      variant="linkOutlined"
      :to="viewLink.to"
      :icon="viewLink.icon"
      class="self-end md:self-auto"
    >
      {{ viewLink.label }}
    </AppButton>

    <AppButton
      v-if="isOpen"
      variant="link"
      class="hidden px-2 md:inline-block"
      @click="$emit('addnew')"
    >
      <font-awesome-icon :icon="faPlus" class="text" />
      {{ t('callout.addLocation') }}
    </AppButton>
  </header>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import type { GetCalloutDataWith } from '@type';
import {
  faGlobe,
  faImages,
  faMap,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import AppButton from '@components/button/AppButton.vue';
import AppTitle from '@components/AppTitle.vue';
import { useCallout } from './use-callout';
import { computed, toRef, ref, watch } from 'vue';
import AppDropdownButton from '@components/button/AppDropdownButton.vue';
import AppSelectableList from '@components/AppSelectableList.vue';
import { useRoute } from 'vue-router';

defineEmits<{ (e: 'addnew'): void }>();
const props = defineProps<{
  callout: GetCalloutDataWith<'responseViewSchema' | 'variantNames'>;
  map?: boolean;
}>();

const { t } = useI18n();

const { currentVariant, isOpen, variantItems } = useCallout(
  toRef(props, 'callout')
);

const route = useRoute();

const langOpen = ref(false);

watch(currentVariant, () => {
  langOpen.value = false;
});

const viewLink = computed(() =>
  props.callout.responseViewSchema?.gallery && props.map
    ? {
        to: { name: 'calloutGallery', query: { ...route.query, noIntro: 1 } },
        label: t('callout.views.gallery'),
        icon: faImages,
      }
    : props.callout.responseViewSchema?.map && !props.map
      ? {
          to: { name: 'calloutMap', query: { ...route.query, noIntro: 1 } },
          label: t('callout.views.map'),
          icon: faMap,
        }
      : undefined
);
</script>
