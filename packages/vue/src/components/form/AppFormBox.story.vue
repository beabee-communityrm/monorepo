<script lang="ts" setup>
import { reactive } from 'vue';

import AppFormBox from './AppFormBox.vue';
import AppFormField from './AppFormField.vue';
import AppLabel from './AppLabel.vue';
import AppToggleField from './AppToggleField.vue';

const state = reactive({
  title: 'Form Section',
  help: 'This section contains related form fields.',
  showHelp: true,
  showNotification: false,
  notificationVariant: 'warning' as const,
  notificationTitle: 'Important information',
  notificationDescription: 'This section requires your attention.',
});

const variants = ['primary', 'success', 'warning', 'error', 'info'] as const;
</script>

<template>
  <Story title="Form/AppFormBox">
    <Variant title="Playground">
      <div class="flex max-w-2xl flex-col gap-4">
        <AppFormBox
          :title="state.title"
          :help="state.showHelp ? state.help : undefined"
          :notification="
            state.showNotification
              ? {
                  title: state.notificationTitle,
                  description: state.notificationDescription,
                  variant: state.notificationVariant,
                  mode: 'inline',
                  removeable: false,
                }
              : undefined
          "
        >
          <AppFormField>
            <AppLabel label="Username" required />
            <input
              type="text"
              class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
              placeholder="Enter username"
            />
          </AppFormField>

          <AppFormField
            help="Choose a secure password with at least 8 characters."
          >
            <AppLabel label="Password" required />
            <input
              type="password"
              class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
              placeholder="Enter password"
            />
          </AppFormField>
        </AppFormBox>
      </div>

      <template #controls>
        <HstText v-model="state.title" title="Title" />
        <HstText v-model="state.help" title="Help Text" />
        <HstCheckbox v-model="state.showHelp" title="Show Help" />
        <HstCheckbox
          v-model="state.showNotification"
          title="Show Notification"
        />
        <HstSelect
          v-model="state.notificationVariant"
          title="Notification Variant"
          :options="variants"
        />
        <HstText v-model="state.notificationTitle" title="Notification Title" />
        <HstText
          v-model="state.notificationDescription"
          title="Notification Description"
        />
      </template>
    </Variant>

    <Variant title="With Title">
      <div class="flex max-w-2xl flex-col gap-4">
        <AppFormBox title="Personal Information">
          <AppFormField>
            <AppLabel label="Full Name" required />
            <input
              type="text"
              class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
              placeholder="Enter your full name"
            />
          </AppFormField>

          <AppFormField>
            <AppLabel label="Email Address" required />
            <input
              type="email"
              class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
              placeholder="Enter your email"
            />
          </AppFormField>
        </AppFormBox>
      </div>
    </Variant>

    <Variant title="With Help Text">
      <div class="flex max-w-2xl flex-col gap-4">
        <AppFormBox
          title="Account Settings"
          help="These settings control how your account works."
        >
          <AppFormField>
            <AppToggleField
              :model-value="true"
              label="Enable Two-Factor Authentication"
              description="Add an extra layer of security to your account"
            />
          </AppFormField>

          <AppFormField>
            <AppToggleField
              :model-value="false"
              label="Receive Email Notifications"
              description="Get notified about account activity"
            />
          </AppFormField>
        </AppFormBox>
      </div>
    </Variant>

    <Variant title="With Notification">
      <div class="flex max-w-2xl flex-col gap-4">
        <AppFormBox
          title="Danger Zone"
          :notification="{
            title: 'Warning',
            description: 'These actions cannot be undone.',
            variant: 'warning',
            mode: 'inline',
            removeable: false,
          }"
        >
          <AppFormField>
            <AppLabel label="Delete Account" />
            <div class="mt-2">
              <button
                type="button"
                class="rounded bg-danger px-4 py-2 text-white hover:bg-danger-110"
              >
                Delete My Account
              </button>
            </div>
          </AppFormField>
        </AppFormBox>
      </div>
    </Variant>

    <Variant title="Multiple Form Boxes">
      <div class="flex max-w-2xl flex-col gap-4">
        <AppFormBox title="Basic Information">
          <AppFormField>
            <AppLabel label="Name" required />
            <input
              type="text"
              class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
            />
          </AppFormField>
        </AppFormBox>

        <AppFormBox title="Contact Information">
          <AppFormField>
            <AppLabel label="Email" required />
            <input
              type="email"
              class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
            />
          </AppFormField>
        </AppFormBox>

        <AppFormBox
          title="Privacy Settings"
          help="Control how your information is shared."
        >
          <AppFormField>
            <AppToggleField
              :model-value="true"
              label="Public Profile"
              description="Allow others to see your profile"
            />
          </AppFormField>
        </AppFormBox>
      </div>
    </Variant>
  </Story>
</template>
