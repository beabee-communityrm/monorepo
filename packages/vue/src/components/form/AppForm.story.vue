<script lang="ts" setup>
import { reactive, ref } from 'vue';
import AppForm from './AppForm.vue';
import AppFormField from './AppFormField.vue';
import AppLabel from './AppLabel.vue';
import AppFormBox from './AppFormBox.vue';

const state = reactive({
  buttonText: 'Submit',
  resetButtonText: 'Reset',
  successText: 'Form submitted successfully!',
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

function resetForm() {
  formData.username = '';
  formData.email = '';
  formData.password = '';
}
</script>

<template>
  <Story title="Components/Form/AppForm">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <AppForm
          :button-text="state.buttonText"
          :reset-button-text="state.resetButtonText"
          :success-text="state.successText"
          :error-text="customErrors"
          :inline-error="state.inlineError"
          :full-button="state.fullButton"
          :on-submit="handleSubmit"
          @reset="resetForm"
        >
          <AppFormField>
            <AppLabel label="Username" required />
            <input
              v-model="formData.username"
              type="text"
              class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
              placeholder="Enter username"
              required
            />
          </AppFormField>

          <AppFormField>
            <AppLabel label="Email" required />
            <input
              v-model="formData.email"
              type="email"
              class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
              placeholder="Enter email"
              required
            />
          </AppFormField>

          <AppFormField>
            <AppLabel label="Password" required />
            <input
              v-model="formData.password"
              type="password"
              class="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border border-grey-light px-3 py-2 shadow-sm focus:outline-none"
              placeholder="Enter password"
              required
            />
          </AppFormField>
        </AppForm>
      </div>

      <template #controls>
        <HstText v-model="state.buttonText" title="Button Text" />
        <HstText v-model="state.resetButtonText" title="Reset Button Text" />
        <HstText v-model="state.successText" title="Success Text" />
        <HstCheckbox v-model="state.inlineError" title="Inline Error" />
        <HstCheckbox v-model="state.fullButton" title="Full Width Button" />
        <HstCheckbox v-model="state.hasError" title="Simulate Error" />
        <HstSelect
          v-model="state.errorCode"
          title="Error Code"
          :options="['unknown', 'duplicate-email', 'invalid-password']"
        />
      </template>
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
