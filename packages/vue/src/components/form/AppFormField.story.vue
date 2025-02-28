<script lang="ts" setup>
import { reactive } from 'vue';
import AppFormField from './AppFormField.vue';
import AppLabel from './AppLabel.vue';

const state = reactive({
  help: 'This is help text that provides additional information about this field.',
  showHelp: true,
});
</script>

<template>
  <Story title="Components/Form/AppFormField">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <AppFormField :help="state.showHelp ? state.help : undefined">
          <AppLabel label="Field Label" />
          <input
            type="text"
            class="border-gray-300 focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none"
            placeholder="Enter value"
          />
        </AppFormField>
      </div>

      <template #controls>
        <HstText v-model="state.help" title="Help Text" />
        <HstCheckbox v-model="state.showHelp" title="Show Help" />
      </template>
    </Variant>

    <Variant title="With Help Text">
      <div class="flex max-w-md flex-col gap-4">
        <AppFormField
          help="This help text provides additional context for the field."
        >
          <AppLabel label="Username" />
          <input
            type="text"
            class="border-gray-300 focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none"
            placeholder="Enter username"
          />
        </AppFormField>
      </div>
    </Variant>

    <Variant title="Without Help Text">
      <div class="flex max-w-md flex-col gap-4">
        <AppFormField>
          <AppLabel label="Email Address" />
          <input
            type="email"
            class="border-gray-300 focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none"
            placeholder="Enter email"
          />
        </AppFormField>
      </div>
    </Variant>

    <Variant title="With HTML in Help Text">
      <div class="flex max-w-md flex-col gap-4">
        <AppFormField
          help="This text includes <strong>HTML</strong> and a <a href='#' class='text-link hover:underline'>link</a>."
        >
          <AppLabel label="Password" />
          <input
            type="password"
            class="border-gray-300 focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none"
            placeholder="Enter password"
          />
        </AppFormField>
      </div>
    </Variant>

    <Variant title="Multiple Fields">
      <div class="flex max-w-md flex-col gap-4">
        <AppFormField help="Enter your full name as it appears on your ID.">
          <AppLabel label="Full Name" required />
          <input
            type="text"
            class="border-gray-300 focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none"
            placeholder="Enter full name"
          />
        </AppFormField>

        <AppFormField
          help="We'll use this email to contact you about your account."
        >
          <AppLabel label="Email Address" required />
          <input
            type="email"
            class="border-gray-300 focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none"
            placeholder="Enter email"
          />
        </AppFormField>

        <AppFormField>
          <AppLabel label="Phone Number" />
          <input
            type="tel"
            class="border-gray-300 focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none"
            placeholder="Enter phone number"
          />
        </AppFormField>
      </div>
    </Variant>
  </Story>
</template>
