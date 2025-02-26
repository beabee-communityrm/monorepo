<script lang="ts" setup>
import { faUser } from '@fortawesome/free-solid-svg-icons';
import AppDropdownButton from './AppDropdownButton.vue';
</script>

<template>
  <Story title="Buttons/AppDropdownButton">
    <Variant title="Basic">
      <AppDropdownButton
        :icon="faUser"
        title="Select User"
        variant="primaryOutlined"
        :show-title="true"
      >
        <div class="p-4">
          <div class="hover:bg-gray-100 cursor-pointer p-2">User 1</div>
          <div class="hover:bg-gray-100 cursor-pointer p-2">User 2</div>
          <div class="hover:bg-gray-100 cursor-pointer p-2">User 3</div>
        </div>
      </AppDropdownButton>
    </Variant>

    <Variant title="Icon Only">
      <AppDropdownButton
        :icon="faUser"
        title="Select User"
        variant="primaryOutlined"
      >
        <div class="p-4">
          <div class="hover:bg-gray-100 cursor-pointer p-2">User 1</div>
          <div class="hover:bg-gray-100 cursor-pointer p-2">User 2</div>
          <div class="hover:bg-gray-100 cursor-pointer p-2">User 3</div>
        </div>
      </AppDropdownButton>
    </Variant>
  </Story>
</template>
