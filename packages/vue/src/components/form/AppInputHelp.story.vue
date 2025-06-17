<script lang="ts" setup>
import { reactive } from 'vue';

import AppInputHelp from './AppInputHelp.vue';

const state = reactive({
  message: 'This is a helpful message to guide the user',
});
</script>

<template>
  <Story title="Form/AppInputHelp">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <AppInputHelp :message="state.message" />
      </div>

      <template #controls>
        <HstText v-model="state.message" title="Help Message" />
      </template>
    </Variant>

    <Variant title="Example Messages">
      <div class="flex max-w-md flex-col gap-4">
        <div class="rounded border p-4">
          <h3 class="mb-2 text-sm font-semibold">Password Requirements</h3>
          <AppInputHelp
            message="Password must be at least 8 characters long and include uppercase, lowercase, and numbers"
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-2 text-sm font-semibold">Email Format</h3>
          <AppInputHelp
            message="We'll use this email to send you important updates about your membership"
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-2 text-sm font-semibold">Optional Field</h3>
          <AppInputHelp
            message="This field is optional but helps us provide better service"
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-2 text-sm font-semibold">Format Instructions</h3>
          <AppInputHelp
            message="Please enter your phone number in the format: +1 (555) 123-4567"
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-2 text-sm font-semibold">Length Guidance</h3>
          <AppInputHelp
            message="Keep your bio under 200 characters for best display"
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
