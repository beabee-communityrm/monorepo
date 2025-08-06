<!--
  # AppColor Stories
  Demonstrates various use cases and variants of the AppColor component
-->
<template>
  <Story title="Badge/AppColor" :layout="{ type: 'grid', width: '50%' }">
    <Variant title="Primary Colors">
      <div class="space-y-4">
        <h4 class="font-semibold text-body">Primary Color Palette</h4>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <AppColor name="bg-primary" shade="Primary" />
          <AppColor name="bg-primary-40" shade="Primary 40" />
          <AppColor name="bg-primary-70" shade="Primary 70" />
        </div>
      </div>
    </Variant>

    <Variant title="Secondary Colors">
      <div class="space-y-4">
        <h4 class="font-semibold text-body">Secondary Color Palette</h4>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <AppColor name="bg-grey" shade="Grey" />
          <AppColor name="bg-grey-light" shade="Grey Light" />
          <AppColor name="bg-grey-lighter" shade="Grey Lighter" />
        </div>
      </div>
    </Variant>

    <Variant title="Status Colors">
      <div class="space-y-4">
        <h4 class="font-semibold text-body">Status Color Palette</h4>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <AppColor name="bg-success" shade="Success" />
          <AppColor name="bg-warning" shade="Warning" />
          <AppColor name="bg-danger" shade="Danger" />
          <AppColor name="bg-info" shade="Info" />
        </div>
      </div>
    </Variant>

    <Variant title="Interactive Example" auto-props-disabled>
      <template #default="{ state }">
        <div class="space-y-4">
          <h4 class="font-semibold text-body">Customizable Color</h4>
          <AppColor :name="state.colorName" :shade="state.colorShade" />

          <div class="space-y-2">
            <label class="block text-sm font-medium text-body">
              Color CSS Class:
              <select
                v-model="state.colorName"
                class="mt-1 block w-full rounded border border-grey-light p-2"
              >
                <option value="bg-primary">bg-primary</option>
                <option value="bg-success">bg-success</option>
                <option value="bg-warning">bg-warning</option>
                <option value="bg-danger">bg-danger</option>
                <option value="bg-grey">bg-grey</option>
              </select>
            </label>

            <label class="block text-sm font-medium text-body">
              Shade Name:
              <input
                v-model="state.colorShade"
                type="text"
                class="mt-1 block w-full rounded border border-grey-light p-2"
                placeholder="Enter shade name"
              />
            </label>
          </div>
        </div>
      </template>
    </Variant>

    <Variant title="Compact List">
      <div class="space-y-4">
        <h4 class="font-semibold text-body">Color List</h4>
        <div class="space-y-2" role="list" aria-label="Available colors">
          <AppColor name="bg-red-500" shade="Red 500" />
          <AppColor name="bg-blue-500" shade="Blue 500" />
          <AppColor name="bg-green-500" shade="Green 500" />
          <AppColor name="bg-yellow-500" shade="Yellow 500" />
          <AppColor name="bg-purple-500" shade="Purple 500" />
        </div>
      </div>
    </Variant>
  </Story>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';

import AppColor from './AppColor.vue';

// State for interactive example
const state = reactive({
  colorName: 'bg-primary',
  colorShade: 'Primary Blue',
});
</script>
