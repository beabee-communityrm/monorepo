<script lang="ts" setup>
import { reactive } from 'vue';

import AppLoadingSpinner from './AppLoadingSpinner.vue';

const state = reactive({
  loading: true,
  message: 'Loading...',
  inverted: false,
});
</script>

<template>
  <Story title="Status/AppLoadingSpinner">
    <Variant title="Playground">
      <div
        class="flex min-h-[120px] items-center justify-center rounded border border-primary-40 bg-white p-6"
      >
        <AppLoadingSpinner
          :loading="state.loading"
          :message="state.message"
          :inverted="state.inverted"
        />
      </div>

      <template #controls>
        <HstCheckbox v-model="state.loading" title="Loading" />
        <HstText v-model="state.message" title="Message" />
        <HstCheckbox
          v-model="state.inverted"
          title="Inverted (dark background)"
        />
      </template>
    </Variant>

    <Variant title="On dark overlay">
      <div
        class="flex min-h-[120px] items-center justify-center rounded bg-black/50 p-6"
      >
        <AppLoadingSpinner loading inverted />
      </div>
    </Variant>
  </Story>
</template>
