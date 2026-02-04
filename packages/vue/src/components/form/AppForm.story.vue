<script lang="ts" setup>
import { reactive, ref } from 'vue';

import AppForm from './AppForm.vue';
import AppFormBox from './AppFormBox.vue';
import AppFormField from './AppFormField.vue';
import AppLabel from './AppLabel.vue';

const state = reactive({
  buttonText: 'Submit',
  resetButtonText: 'Reset',
  successText: '',
  inlineError: false,
  fullButton: false,
  isSubmitting: false,
  hasError: false,
  errorCode: 'unknown',
});

const formData = reactive({
  username: '',
  email: '',
  password: '',
});

const customErrors = {
  'duplicate-email': 'This email is already in use.',
  'invalid-password': 'Password must be at least 8 characters long.',
};

async function handleSubmit() {
  state.isSubmitting = true;

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (state.hasError) {
    state.isSubmitting = false;
    throw { code: state.errorCode };
  }

  state.isSubmitting = false;
}

async function handleSubmitWithError() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  throw new Error('Simulated error');
}

function resetForm() {
  formData.username = '';
  formData.email = '';
  formData.password = '';
}
</script>

<template>
  <Story title="Form/AppForm">
    <Variant title="Default Success Message" :init-state="() => state">
      <template #default="{ state }">
        <div class="max-w-md">
          <AppForm
            :button-text="state.buttonText"
            :reset-button-text="state.resetButtonText"
            :success-text="state.successText || undefined"
            :inline-error="state.inlineError"
            :full-button="state.fullButton"
            @submit="handleSubmit"
            @reset="() => console.log('Form reset')"
          >
            <div class="space-y-4">
              <input
                class="w-full rounded border p-2"
                placeholder="Sample input field"
              />
              <textarea
                class="w-full rounded border p-2"
                placeholder="Sample textarea"
                rows="3"
              />
            </div>
          </AppForm>
          <p class="mt-4 text-sm text-body-80">
            <strong>Default behavior:</strong> When no successText is provided,
            the form uses the internal i18n message "Saved!" (t('form.saved'))
          </p>
        </div>
      </template>

      <template #controls="{ state }">
        <HstText v-model="state.buttonText" title="Button Text" />
        <HstText v-model="state.resetButtonText" title="Reset Button Text" />
        <HstText
          v-model="state.successText"
          title="Custom Success Text (leave empty for default)"
        />
        <HstCheckbox v-model="state.inlineError" title="Inline Error" />
        <HstCheckbox v-model="state.fullButton" title="Full Button" />
      </template>
    </Variant>

    <!-- Custom success message example -->
    <Variant title="Custom Success Message">
      <div class="max-w-md">
        <AppForm
          button-text="Update Profile"
          success-text="Profile updated successfully!"
          @submit="handleSubmit"
        >
          <div class="space-y-4">
            <input
              class="w-full rounded border p-2"
              placeholder="Name"
              value="John Doe"
            />
            <input
              class="w-full rounded border p-2"
              placeholder="Email"
              value="john@example.com"
            />
          </div>
        </AppForm>
        <p class="mt-4 text-sm text-body-80">
          <strong>Custom success message:</strong> This form provides a
          context-specific success message for profile updates.
        </p>
      </div>
    </Variant>

    <!-- Error handling example -->
    <Variant title="Error Handling">
      <div class="max-w-md">
        <AppForm
          button-text="Submit (will fail)"
          inline-error
          @submit="handleSubmitWithError"
        >
          <div class="space-y-4">
            <input
              class="w-full rounded border p-2"
              placeholder="This will trigger an error"
            />
          </div>
        </AppForm>
        <p class="mt-4 text-sm text-body-80">
          <strong>Error demonstration:</strong> This form will show an inline
          error when submitted.
        </p>
      </div>
    </Variant>

    <!-- Real-world examples -->
    <Variant title="Real-World Examples">
      <div class="space-y-8">
        <!-- Settings form (uses default) -->
        <div class="max-w-md">
          <h3 class="mb-4 font-semibold">Settings Form (Default Success)</h3>
          <AppForm
            button-text="Save Settings"
            reset-button-text="Reset"
            @submit="handleSubmit"
            @reset="() => console.log('Settings reset')"
          >
            <div class="space-y-4">
              <label class="block">
                <span class="text-sm font-medium">Site Name</span>
                <input
                  class="mt-1 w-full rounded border p-2"
                  value="My Organization"
                />
              </label>
              <label class="block">
                <span class="text-sm font-medium">Description</span>
                <textarea class="mt-1 w-full rounded border p-2" rows="3">
A community platform for engagement</textarea
                >
              </label>
            </div>
          </AppForm>
          <p class="text-body-70 mt-2 text-xs">
            Uses default "Saved!" message - perfect for settings pages
          </p>
        </div>

        <!-- Password reset (custom message) -->
        <div class="max-w-md">
          <h3 class="mb-4 font-semibold">Password Reset (Custom Success)</h3>
          <AppForm
            button-text="Reset Password"
            success-text="Your password has been reset successfully!"
            @submit="handleSubmit"
          >
            <div class="space-y-4">
              <label class="block">
                <span class="text-sm font-medium">New Password</span>
                <input
                  type="password"
                  class="mt-1 w-full rounded border p-2"
                  placeholder="Enter new password"
                />
              </label>
              <label class="block">
                <span class="text-sm font-medium">Confirm Password</span>
                <input
                  type="password"
                  class="mt-1 w-full rounded border p-2"
                  placeholder="Confirm new password"
                />
              </label>
            </div>
          </AppForm>
          <p class="text-body-70 mt-2 text-xs">
            Uses custom success message - perfect for special operations
          </p>
        </div>
      </div>
    </Variant>

    <Variant title="Basic Form">
      <div class="flex max-w-md flex-col gap-4">
        <AppForm button-text="Sign In">
          <AppFormField>
            <AppLabel label="Email" required />
            <input
              type="email"
              class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
              placeholder="Enter email"
              required
            />
          </AppFormField>

          <AppFormField>
            <AppLabel label="Password" required />
            <input
              type="password"
              class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
              placeholder="Enter password"
              required
            />
          </AppFormField>
        </AppForm>
      </div>
    </Variant>

    <Variant title="With Reset Button">
      <div class="flex max-w-md flex-col gap-4">
        <AppForm button-text="Save Changes" reset-button-text="Cancel">
          <AppFormField>
            <AppLabel label="Display Name" />
            <input
              type="text"
              class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
              placeholder="Enter display name"
            />
          </AppFormField>

          <AppFormField>
            <AppLabel label="Bio" />
            <textarea
              class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
              rows="3"
              placeholder="Tell us about yourself"
            ></textarea>
          </AppFormField>
        </AppForm>
      </div>
    </Variant>

    <Variant title="With Form Boxes">
      <div class="flex max-w-xl flex-col gap-4">
        <AppForm
          button-text="Create Account"
          success-text="Account created successfully!"
        >
          <AppFormBox title="Personal Information">
            <AppFormField>
              <AppLabel label="Full Name" required />
              <input
                type="text"
                class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
                placeholder="Enter your full name"
                required
              />
            </AppFormField>

            <AppFormField>
              <AppLabel label="Email" required />
              <input
                type="email"
                class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
                placeholder="Enter your email"
                required
              />
            </AppFormField>
          </AppFormBox>

          <AppFormBox title="Account Security">
            <AppFormField
              help="Choose a strong password with at least 8 characters."
            >
              <AppLabel label="Password" required />
              <input
                type="password"
                class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
                placeholder="Enter password"
                required
              />
            </AppFormField>

            <AppFormField>
              <AppLabel label="Confirm Password" required />
              <input
                type="password"
                class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
                placeholder="Confirm password"
                required
              />
            </AppFormField>
          </AppFormBox>
        </AppForm>
      </div>
    </Variant>

    <Variant title="Full Width Button">
      <div class="flex max-w-md flex-col gap-4">
        <AppForm button-text="Sign Up" full-button>
          <AppFormField>
            <AppLabel label="Email" required />
            <input
              type="email"
              class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
              placeholder="Enter email"
              required
            />
          </AppFormField>

          <AppFormField>
            <AppLabel label="Password" required />
            <input
              type="password"
              class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
              placeholder="Enter password"
              required
            />
          </AppFormField>
        </AppForm>
      </div>
    </Variant>
  </Story>
</template>
