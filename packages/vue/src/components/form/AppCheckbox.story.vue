<script lang="ts" setup>
import {
  faBell,
  faEnvelope,
  faShieldAlt,
} from '@fortawesome/free-solid-svg-icons';
import { reactive, ref } from 'vue';

import AppCheckbox from './AppCheckbox.vue';

const state = reactive({
  checked: false,
  variant: 'link' as const,
  disabled: false,
  label: 'Accept terms and conditions',
  icon: undefined,
  required: false,
});

const variants = ['primary', 'link', 'danger'] as const;

// Example checkbox states for different use cases
const acceptTerms = ref(false);
const emailNotifications = ref(true);
const advancedMode = ref(false);
const rememberMe = ref(true);
</script>

<template>
  <Story title="Components/Form/AppCheckbox">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <AppCheckbox
          v-model="state.checked"
          :variant="state.variant"
          :disabled="state.disabled"
          :label="state.label"
          :icon="state.icon"
          :required="state.required"
        />

        <div class="text-sm text-grey-dark">
          <p>Current state: {{ state.checked ? 'Checked' : 'Unchecked' }}</p>
        </div>
      </div>

      <template #controls>
        <HstCheckbox v-model="state.checked" title="Checked" />
        <HstSelect
          v-model="state.variant"
          title="Variant"
          :options="variants"
        />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstCheckbox v-model="state.required" title="Required" />
        <HstText v-model="state.label" title="Label" />
      </template>
    </Variant>

    <Variant title="Variants">
      <div class="flex max-w-md flex-col gap-4">
        <div
          v-for="variant in variants"
          :key="variant"
          class="rounded border p-4"
        >
          <AppCheckbox
            v-model="state.checked"
            :variant="variant"
            :label="`${variant} variant checkbox`"
          />
        </div>
      </div>
    </Variant>

    <Variant title="States">
      <div class="flex max-w-md flex-col gap-4">
        <div class="rounded border p-4">
          <AppCheckbox :model-value="true" label="Checked" />
        </div>
        <div class="rounded border p-4">
          <AppCheckbox :model-value="false" label="Unchecked" />
        </div>
        <div class="rounded border p-4">
          <AppCheckbox
            :model-value="true"
            disabled
            label="Disabled (Checked)"
          />
        </div>
        <div class="rounded border p-4">
          <AppCheckbox
            :model-value="false"
            disabled
            label="Disabled (Unchecked)"
          />
        </div>
        <div class="rounded border p-4">
          <AppCheckbox :model-value="false" required label="Required" />
        </div>
      </div>
    </Variant>

    <Variant title="With Icons">
      <div class="flex max-w-md flex-col gap-4">
        <div class="rounded border p-4">
          <AppCheckbox
            v-model="state.checked"
            label="Notifications"
            :icon="faBell"
          />
        </div>
        <div class="rounded border p-4">
          <AppCheckbox
            v-model="state.checked"
            label="Email updates"
            :icon="faEnvelope"
            variant="primary"
          />
        </div>
        <div class="rounded border p-4">
          <AppCheckbox
            v-model="state.checked"
            label="Enhanced security"
            :icon="faShieldAlt"
            variant="danger"
          />
        </div>
      </div>
    </Variant>

    <Variant title="Example Use Cases">
      <div class="flex max-w-md flex-col gap-4">
        <div class="rounded border p-4">
          <AppCheckbox
            v-model="acceptTerms"
            label="I accept the terms and conditions"
            required
            variant="primary"
          />
        </div>

        <div class="rounded border p-4">
          <AppCheckbox
            v-model="emailNotifications"
            label="Subscribe to email notifications"
            variant="link"
          />
        </div>

        <div class="rounded border p-4">
          <AppCheckbox
            v-model="advancedMode"
            label="Enable advanced features"
          />
        </div>

        <div class="rounded border p-4">
          <AppCheckbox
            v-model="rememberMe"
            label="Remember me"
            variant="primary"
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
