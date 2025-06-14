<script lang="ts" setup>
import { reactive } from 'vue';

import AppFormSection from './AppFormSection.vue';
import AppInput from './AppInput.vue';

const state = reactive({
  help: 'This is helpful information to guide the user.',
  dummyValue: '',
  dummyValue2: '',
});
</script>

<template>
  <Story title="Components/Form/AppFormSection">
    <Variant title="Playground">
      <div class="max-w-2xl">
        <AppFormSection :help="state.help">
          <div class="space-y-4">
            <AppInput
              v-model="state.dummyValue"
              label="Sample Input"
              info-message="This input is inside a form section"
            />
            <AppInput
              v-model="state.dummyValue2"
              label="Another Input"
              type="email"
            />
          </div>
        </AppFormSection>
      </div>

      <template #controls>
        <HstText v-model="state.help" title="Help Text" />
      </template>
    </Variant>

    <Variant title="Examples">
      <div class="max-w-2xl space-y-8">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Basic Form Section</h3>
          <AppFormSection help="Complete your profile information below.">
            <div class="space-y-4">
              <AppInput label="First Name" required />
              <AppInput label="Last Name" required />
              <AppInput label="Email" type="email" required />
            </div>
          </AppFormSection>
        </div>

        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Advanced Settings</h3>
          <AppFormSection
            help="These settings control advanced features. <strong>Use with caution.</strong>"
          >
            <div class="space-y-4">
              <AppInput label="API Key" type="password" />
              <AppInput label="Webhook URL" type="url" />
            </div>
          </AppFormSection>
        </div>
      </div>
    </Variant>
  </Story>
</template>
