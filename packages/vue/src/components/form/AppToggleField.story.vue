<script lang="ts" setup>
import { ref, reactive } from 'vue';
import AppToggleField from './AppToggleField.vue';

const state = reactive({
  enabled: true,
  variant: 'primary' as const,
  size: 'default' as const,
  disabled: false,
  label: 'Toggle feature',
  enabledDescription: 'Feature is currently enabled',
  disabledDescription: 'Feature is currently disabled',
  required: false,
});

const variants = ['primary', 'link', 'danger'] as const;
const sizes = ['default', 'small'] as const;

// Example toggle states for different use cases
const notificationsEnabled = ref(true);
const darkModeEnabled = ref(false);
const autoSaveEnabled = ref(true);
const advancedOptionsVisible = ref(false);
</script>

<template>
  <Story title="Components/Form/AppToggleField">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <AppToggleField
          v-model="state.enabled"
          :variant="state.variant"
          :size="state.size"
          :disabled="state.disabled"
          :label="state.label"
          :enabled-description="state.enabledDescription"
          :disabled-description="state.disabledDescription"
          :required="state.required"
        />

        <div class="text-sm text-grey-dark">
          <p>Current state: {{ state.enabled ? 'On' : 'Off' }}</p>
        </div>
      </div>

      <template #controls>
        <HstCheckbox v-model="state.enabled" title="Enabled" />
        <HstSelect
          v-model="state.variant"
          title="Variant"
          :options="variants"
        />
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstCheckbox v-model="state.required" title="Required" />
        <HstText v-model="state.label" title="Label" />
        <HstText
          v-model="state.enabledDescription"
          title="Enabled Description"
        />
        <HstText
          v-model="state.disabledDescription"
          title="Disabled Description"
        />
      </template>
    </Variant>

    <Variant title="Variants">
      <div class="flex max-w-md flex-col gap-4">
        <div
          v-for="variant in variants"
          :key="variant"
          class="rounded border p-4"
        >
          <AppToggleField
            v-model="state.enabled"
            :variant="variant"
            :label="`${variant} variant`"
            :enabled-description="`This toggle with ${variant} styling is enabled`"
            :disabled-description="`This toggle with ${variant} styling is disabled`"
          />
        </div>
      </div>
    </Variant>

    <Variant title="Sizes">
      <div class="flex max-w-md flex-col gap-4">
        <div v-for="size in sizes" :key="size" class="rounded border p-4">
          <AppToggleField
            v-model="state.enabled"
            :size="size"
            :label="`${size} size`"
            :enabled-description="`This ${size} toggle is enabled`"
            :disabled-description="`This ${size} toggle is disabled`"
          />
        </div>
      </div>
    </Variant>

    <Variant title="States">
      <div class="flex max-w-md flex-col gap-4">
        <div class="rounded border p-4">
          <AppToggleField
            :model-value="true"
            label="Enabled"
            enabled-description="This toggle is currently enabled"
            disabled-description="This toggle is currently disabled"
          />
        </div>
        <div class="rounded border p-4">
          <AppToggleField
            :model-value="false"
            label="Disabled"
            enabled-description="This toggle is currently enabled"
            disabled-description="This toggle is currently disabled"
          />
        </div>
        <div class="rounded border p-4">
          <AppToggleField
            :model-value="true"
            disabled
            label="Disabled (On)"
            enabled-description="This toggle is enabled but can't be changed"
            disabled-description="This toggle is disabled and can't be changed"
          />
        </div>
        <div class="rounded border p-4">
          <AppToggleField
            :model-value="false"
            disabled
            label="Disabled (Off)"
            enabled-description="This toggle is enabled but can't be changed"
            disabled-description="This toggle is disabled and can't be changed"
          />
        </div>
        <div class="rounded border p-4">
          <AppToggleField
            :model-value="true"
            required
            label="Required"
            enabled-description="This required toggle is enabled"
            disabled-description="This required toggle is disabled"
          />
        </div>
      </div>
    </Variant>

    <Variant title="Example Use Cases">
      <div class="flex max-w-md flex-col gap-4">
        <div class="rounded border p-4">
          <AppToggleField
            v-model="notificationsEnabled"
            label="Enable Notifications"
            enabled-description="You will receive notifications about updates and activity"
            disabled-description="You will not receive any notifications"
          />
        </div>

        <div class="rounded border p-4">
          <AppToggleField
            v-model="darkModeEnabled"
            variant="link"
            label="Dark Mode"
            enabled-description="Using dark theme for low-light environments"
            disabled-description="Using light theme for standard environments"
          />
        </div>

        <div class="rounded border p-4">
          <AppToggleField
            v-model="autoSaveEnabled"
            size="small"
            label="Auto-save"
            enabled-description="Changes are automatically saved as you work"
            disabled-description="You need to manually save your changes"
          />
        </div>

        <div class="rounded border p-4">
          <AppToggleField
            v-model="advancedOptionsVisible"
            variant="link"
            size="small"
            label="Show Advanced Options"
            enabled-description="Additional configuration options are displayed"
            disabled-description="Only standard options are displayed"
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
