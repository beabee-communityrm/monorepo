<script lang="ts" setup>
import { ref, reactive } from 'vue';
import AppToggleSwitch from './AppToggleSwitch.vue';

const state = reactive({
  enabled: true,
  variant: 'primary' as const,
  size: 'default' as const,
  disabled: false,
});

const variants = ['primary', 'link', 'danger'] as const;
const sizes = ['default', 'small'] as const;

// Example toggle states for different use cases
const notificationsEnabled = ref(true);
const darkModeEnabled = ref(false);
const autoSaveEnabled = ref(true);
</script>

<template>
  <Story title="Components/Button/AppToggleSwitch">
    <Variant title="Playground">
      <div class="flex flex-col gap-4">
        <AppToggleSwitch
          v-model="state.enabled"
          :variant="state.variant"
          :size="state.size"
          :disabled="state.disabled"
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
      </template>
    </Variant>

    <Variant title="Variants">
      <div class="flex items-center gap-4">
        <div
          v-for="variant in variants"
          :key="variant"
          class="flex flex-col items-center gap-2"
        >
          <span class="text-gray-500 text-sm">{{ variant }}</span>
          <AppToggleSwitch v-model="state.enabled" :variant="variant" />
        </div>
      </div>
    </Variant>

    <Variant title="Sizes">
      <div class="flex items-center gap-4">
        <div
          v-for="size in sizes"
          :key="size"
          class="flex flex-col items-center gap-2"
        >
          <span class="text-gray-500 text-sm">{{ size }}</span>
          <AppToggleSwitch v-model="state.enabled" :size="size" />
        </div>
      </div>
    </Variant>

    <Variant title="States">
      <div class="flex items-center gap-4">
        <div class="flex flex-col items-center gap-2">
          <span class="text-gray-500 text-sm">Enabled</span>
          <AppToggleSwitch :model-value="true" />
        </div>
        <div class="flex flex-col items-center gap-2">
          <span class="text-gray-500 text-sm">Disabled</span>
          <AppToggleSwitch :model-value="false" />
        </div>
        <div class="flex flex-col items-center gap-2">
          <span class="text-gray-500 text-sm">Disabled (On)</span>
          <AppToggleSwitch :model-value="true" disabled />
        </div>
        <div class="flex flex-col items-center gap-2">
          <span class="text-gray-500 text-sm">Disabled (Off)</span>
          <AppToggleSwitch :model-value="false" disabled />
        </div>
      </div>
    </Variant>

    <Variant title="Example Use Cases">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">Enable Notifications</div>
            <div class="text-sm text-body-80">
              Receive notifications about updates and activity
            </div>
          </div>
          <AppToggleSwitch v-model="notificationsEnabled" />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">Dark Mode</div>
            <div class="text-sm text-body-80">
              Switch to dark theme for low-light environments
            </div>
          </div>
          <AppToggleSwitch v-model="darkModeEnabled" variant="link" />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">Auto-save</div>
            <div class="text-sm text-body-80">
              Automatically save changes as you work
            </div>
          </div>
          <AppToggleSwitch v-model="autoSaveEnabled" size="small" />
        </div>
      </div>
    </Variant>
  </Story>
</template>
