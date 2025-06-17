<script lang="ts" setup>
import { reactive, ref } from 'vue';

import AppColorInput from './AppColorInput.vue';

const state = reactive({
  color: '#3b82f6',
  id: 'color-picker-1',
});

const themeState = reactive({
  primaryColor: '#10b981',
  secondaryColor: '#f59e0b',
  accentColor: '#ef4444',
});

const shortHex = ref('#f00');
const longHex = ref('#0066cc');
</script>

<template>
  <Story title="Form/AppColorInput">
    <Variant title="Playground">
      <div class="max-w-md space-y-6">
        <AppColorInput v-model="state.color" :id="state.id" />
        <div class="text-sm text-grey-dark">
          <p>Selected color: {{ state.color }}</p>
          <div
            class="mt-2 h-16 w-16 rounded border"
            :style="{ backgroundColor: state.color }"
          />
        </div>
      </div>

      <template #controls>
        <HstText v-model="state.color" title="Color Value" />
        <HstText v-model="state.id" title="Input ID" />
      </template>
    </Variant>

    <Variant title="Examples">
      <div class="max-w-md space-y-8">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Theme Colors</h3>

          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium"
                >Primary Color</label
              >
              <AppColorInput
                v-model="themeState.primaryColor"
                id="primary-color"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium"
                >Secondary Color</label
              >
              <AppColorInput
                v-model="themeState.secondaryColor"
                id="secondary-color"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium">Accent Color</label>
              <AppColorInput
                v-model="themeState.accentColor"
                id="accent-color"
              />
            </div>
          </div>

          <div class="mt-6">
            <h4 class="mb-3 text-sm font-semibold">Color Preview</h4>
            <div class="flex gap-2">
              <div
                class="h-12 w-12 rounded border"
                :style="{ backgroundColor: themeState.primaryColor }"
                :title="`Primary: ${themeState.primaryColor}`"
              />
              <div
                class="h-12 w-12 rounded border"
                :style="{ backgroundColor: themeState.secondaryColor }"
                :title="`Secondary: ${themeState.secondaryColor}`"
              />
              <div
                class="h-12 w-12 rounded border"
                :style="{ backgroundColor: themeState.accentColor }"
                :title="`Accent: ${themeState.accentColor}`"
              />
            </div>
          </div>
        </div>

        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Common Use Cases</h3>

          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium"
                >Background Color</label
              >
              <AppColorInput v-model="state.color" id="bg-color" />
            </div>

            <div class="rounded p-4" :style="{ backgroundColor: state.color }">
              <p class="text-sm">This background uses the selected color</p>
            </div>
          </div>
        </div>

        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Different Color Formats</h3>

          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium"
                >Hex Color (3-digit)</label
              >
              <AppColorInput v-model="shortHex" id="short-hex" />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium"
                >Hex Color (6-digit)</label
              >
              <AppColorInput v-model="longHex" id="long-hex" />
            </div>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
