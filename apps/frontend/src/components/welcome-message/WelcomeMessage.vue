<template>
  <div class="relative rounded bg-white p-4 shadow" :class="!small && 'lg:p-8'">
    <div>
      <WelcomeIcon
        class="float-left mb-4 mr-4 h-auto w-[4.5rem] md:w-[7.5rem]"
        :class="!small && 'lg:mb-8 lg:mr-8 lg:w-[17rem]'"
      />

      <AppSubHeading>
        {{ t('homePage.welcome', { firstName, lastName }) }}
      </AppSubHeading>
    </div>

    <div
      class="content-message whitespace-normal text-sm leading-5 md:text-base md:leading-5.5"
      :class="!small && 'lg:leading-6'"
      v-html="text"
    />

    <div class="clear-left" />

    <font-awesome-icon
      class="absolute right-4 top-4 cursor-pointer text-2xl"
      :icon="faTimes"
      @click="$emit('close')"
    />
  </div>
</template>

<script lang="ts" setup>
import WelcomeIcon from './WelcomeIcon.vue';
import { useI18n } from 'vue-i18n';
import AppSubHeading from '../AppSubHeading.vue';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const { t } = useI18n();

defineProps<{
  firstName: string;
  lastName: string;
  text: string;
  small?: boolean;
}>();

defineEmits(['close']);
</script>
