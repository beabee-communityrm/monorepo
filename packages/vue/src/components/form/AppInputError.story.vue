<script lang="ts" setup>
import { reactive } from 'vue';

import AppInputError from './AppInputError.vue';

const state = reactive({
  message: 'This field is required',
});
</script>

<template>
  <Story title="Components/Form/AppInputError">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <AppInputError :message="state.message" />
      </div>

      <template #controls>
        <HstText v-model="state.message" title="Error Message" />
      </template>
    </Variant>

    <Variant title="Example Messages">
      <div class="flex max-w-md flex-col gap-4">
        <div class="rounded border p-4">
          <h3 class="mb-2 text-sm font-semibold">Required Field</h3>
          <AppInputError message="This field is required" />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-2 text-sm font-semibold">Email Validation</h3>
          <AppInputError message="Please enter a valid email address" />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-2 text-sm font-semibold">Password Validation</h3>
          <AppInputError
            message="Password must be at least 8 characters long and contain uppercase, lowercase, and numbers"
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-2 text-sm font-semibold">Minimum Length</h3>
          <AppInputError message="Minimum length is 3 characters" />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-2 text-sm font-semibold">Maximum Length</h3>
          <AppInputError message="Maximum length is 50 characters" />
        </div>
      </div>
    </Variant>
  </Story>
</template>
