<script lang="ts" setup>
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { reactive, ref } from 'vue';

import AppInput from './AppInput.vue';

const state = reactive({
  value: '',
  type: 'text' as const,
  name: 'username',
  label: 'Username',
  infoMessage: '',
  required: false,
  disabled: false,
  min: undefined as number | string | undefined,
  max: undefined as number | string | undefined,
  prefix: '',
  suffix: '',
  copyable: false,
  copyButtonDisabled: false,
});

const inputTypes = [
  'text',
  'email',
  'password',
  'number',
  'url',
  'date',
  'time',
] as const;

// Different example inputs
const textValue = ref('');
const emailValue = ref('');
const passwordValue = ref('');
const numberValue = ref(0);
const urlValue = ref('');
const dateValue = ref('');
const timeValue = ref('');
</script>

<template>
  <Story title="Form/AppInput">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <AppInput
          v-model="state.value"
          :type="state.type"
          :name="state.name"
          :label="state.label"
          :info-message="state.infoMessage"
          :required="state.required"
          :disabled="state.disabled"
          :min="state.min"
          :max="state.max"
          :prefix="state.prefix"
          :suffix="state.suffix"
          :copyable="state.copyable"
          :copy-button-disabled="state.copyButtonDisabled"
        />

        <div class="text-sm text-grey-dark">
          <p>Current value: {{ state.value }}</p>
        </div>
      </div>

      <template #controls>
        <HstText v-model="state.value" title="Value" />
        <HstSelect v-model="state.type" title="Type" :options="inputTypes" />
        <HstText v-model="state.name" title="Name" />
        <HstText v-model="state.label" title="Label" />
        <HstText v-model="state.infoMessage" title="Info Message" />
        <HstCheckbox v-model="state.required" title="Required" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstText v-model="state.prefix" title="Prefix" />
        <HstText v-model="state.suffix" title="Suffix" />
        <HstCheckbox v-model="state.copyable" title="Copyable" />
        <HstCheckbox
          v-model="state.copyButtonDisabled"
          title="Copy Button Disabled"
        />
      </template>
    </Variant>

    <Variant title="Input Types">
      <div class="flex max-w-md flex-col gap-6">
        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">Text Input</h3>
          <AppInput
            v-model="textValue"
            type="text"
            label="Full Name"
            info-message="Enter your first and last name"
            required
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">Email Input</h3>
          <AppInput
            v-model="emailValue"
            type="email"
            label="Email Address"
            info-message="We'll use this to send you updates"
            required
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">Password Input</h3>
          <AppInput
            v-model="passwordValue"
            type="password"
            label="Password"
            info-message="Must be at least 8 characters with uppercase, lowercase, and numbers"
            required
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">Number Input</h3>
          <AppInput
            v-model="numberValue"
            type="number"
            label="Age"
            :min="18"
            :max="120"
            info-message="Must be between 18 and 120"
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">URL Input</h3>
          <AppInput
            v-model="urlValue"
            type="url"
            label="Website"
            info-message="Include http:// or https://"
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">Date Input</h3>
          <AppInput v-model="dateValue" type="date" label="Date of Birth" />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">Time Input</h3>
          <AppInput
            v-model="timeValue"
            type="time"
            label="Preferred Meeting Time"
          />
        </div>
      </div>
    </Variant>

    <Variant title="With Prefix and Suffix">
      <div class="flex max-w-md flex-col gap-6">
        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">Currency Input</h3>
          <AppInput
            v-model="numberValue"
            type="number"
            label="Amount"
            prefix="$"
            suffix="USD"
            :min="0"
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">Username Input</h3>
          <AppInput
            v-model="textValue"
            type="text"
            label="Username"
            prefix="@"
            info-message="Choose a unique username"
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">API Key Input</h3>
          <AppInput
            v-model="textValue"
            type="text"
            label="API Key"
            prefix="sk_"
            copyable
            info-message="Keep this secret and secure"
          />
        </div>
      </div>
    </Variant>

    <Variant title="States">
      <div class="flex max-w-md flex-col gap-6">
        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">Standard</h3>
          <AppInput
            v-model="textValue"
            label="Standard Input"
            info-message="This is a standard input field"
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">Required</h3>
          <AppInput
            v-model="textValue"
            label="Required Input"
            required
            info-message="This field must be filled out"
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">Disabled</h3>
          <AppInput
            v-model="textValue"
            label="Disabled Input"
            disabled
            info-message="This field is disabled"
          />
        </div>

        <div class="rounded border p-4">
          <h3 class="mb-3 text-sm font-semibold">With Copy Button</h3>
          <AppInput
            v-model="textValue"
            label="Copyable Input"
            copyable
            info-message="Click the copy button to copy this value"
          />
        </div>
      </div>
    </Variant>

    <Variant title="With prefixAction and suffixAction">
      <div class="max-w-md">
        <AppInput
          v-model="textValue"
          label="With action slots"
          disabled
          hide-error-message
          class="w-52"
        >
          <template #prefixAction>
            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center text-primary-80 hover:bg-primary-10 focus:outline-none"
              aria-label="Previous"
            >
              <font-awesome-icon :icon="faCaretLeft" aria-hidden="true" />
            </button>
          </template>
          <template #suffixAction>
            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center text-primary-80 hover:bg-primary-10 focus:outline-none"
              aria-label="Next"
            >
              <font-awesome-icon :icon="faCaretRight" aria-hidden="true" />
            </button>
          </template>
        </AppInput>
      </div>
    </Variant>
  </Story>
</template>
