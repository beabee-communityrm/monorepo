<template>
  <a :href="notice.url">
    <div class="mb-2 flex rounded bg-white p-4.5 shadow">
      <div class="flex md:mt-1.5">
        <font-awesome-icon
          class="mr-2 self-start text-xl text-warning md:mt-1"
          :icon="faBullhorn"
        />

        <div class="pr-3 text-sm md:text-lg">
          {{ notice.text }}
        </div>
      </div>

      <div
        v-if="notice.url && notice.buttonText"
        class="ml-auto hidden md:flex"
      >
        <AppButton :href="notice.url">{{ notice.buttonText }}</AppButton>
      </div>
    </div>
  </a>
</template>

<script lang="ts" setup>
import type { GetNoticeData } from '@beabee/beabee-common';
import { AppButton } from '@beabee/vue';

import { faBullhorn } from '@fortawesome/free-solid-svg-icons';

/**
 * Notice component for displaying promotional or informational notices
 *
 * @example
 * ```vue
 * <AppNotice :notice="noticeData" />
 * ```
 */

defineProps<{
  /** Notice data object */
  notice: GetNoticeData;
}>();
</script>
