<script lang="ts" setup>
import { ref, reactive } from 'vue';
import AppToggleField from './AppToggleField.vue';

const state = reactive({
  enabled: true,
  variant: 'primary' as const,
  size: 'default' as const,
  disabled: false,
  label: 'Toggle feature',
  description: 'Enable or disable this feature',
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
          :description="state.description"
          :required="state.required"
        />

        <div class="text-gray-500 text-sm">
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
        <HstText v-model="state.description" title="Description" />
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
            :description="`This is a toggle field with ${variant} styling`"
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
            :description="`This is a toggle field with ${size} size`"
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
            description="This toggle is enabled"
          />
        </div>
        <div class="rounded border p-4">
          <AppToggleField
            :model-value="false"
            label="Disabled"
            description="This toggle is disabled"
          />
        </div>
        <div class="rounded border p-4">
          <AppToggleField
            :model-value="true"
            disabled
            label="Disabled (On)"
            description="This toggle is disabled in the ON state"
          />
        </div>
        <div class="rounded border p-4">
          <AppToggleField
            :model-value="false"
            disabled
            label="Disabled (Off)"
            description="This toggle is disabled in the OFF state"
          />
        </div>
        <div class="rounded border p-4">
          <AppToggleField
            :model-value="true"
            required
            label="Required"
            description="This toggle is required"
          />
        </div>
      </div>
    </Variant>

    <Variant title="Without Description">
      <div class="flex max-w-md flex-col gap-4">
        <AppToggleField
          v-model="state.enabled"
          label="Toggle without description"
        />
      </div>
    </Variant>

    <Variant title="Without Label">
      <div class="flex max-w-md flex-col gap-4">
        <AppToggleField
          v-model="state.enabled"
          description="This toggle has no label, only a description"
        />
      </div>
    </Variant>

    <Variant title="Example Use Cases">
      <div class="flex max-w-md flex-col gap-4">
        <div class="rounded border p-4">
          <AppToggleField
            v-model="notificationsEnabled"
            label="Enable Notifications"
            description="Receive notifications about updates and activity"
          />
        </div>

        <div class="rounded border p-4">
          <AppToggleField
            v-model="darkModeEnabled"
            variant="link"
            label="Dark Mode"
            description="Switch to dark theme for low-light environments"
          />
        </div>

        <div class="rounded border p-4">
          <AppToggleField
            v-model="autoSaveEnabled"
            size="small"
            label="Auto-save"
            description="Automatically save changes as you work"
          />
        </div>

        <div class="rounded border p-4">
          <AppToggleField
            v-model="advancedOptionsVisible"
            variant="link"
            size="small"
            label="Show Advanced Options"
            description="Display additional configuration options for power users"
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
