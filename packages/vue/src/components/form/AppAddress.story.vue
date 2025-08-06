<script lang="ts" setup>
import { reactive } from 'vue';

import AppAddress from './AppAddress.vue';

const state = reactive({
  line1: '',
  line2: '',
  cityOrTown: '',
  postCode: '',
  required: false,
});
</script>

<template>
  <Story title="Form/AppAddress">
    <Variant title="Playground">
      <div class="max-w-md">
        <AppAddress
          v-model:line1="state.line1"
          v-model:line2="state.line2"
          v-model:city-or-town="state.cityOrTown"
          v-model:post-code="state.postCode"
          :required="state.required"
        />
      </div>

      <template #controls>
        <HstText v-model="state.line1" title="Address Line 1" />
        <HstText v-model="state.line2" title="Address Line 2" />
        <HstText v-model="state.cityOrTown" title="City/Town" />
        <HstText v-model="state.postCode" title="Post Code" />
        <HstCheckbox v-model="state.required" title="Required" />
      </template>
    </Variant>

    <Variant title="Basic Example">
      <div class="max-w-md">
        <AppAddress
          v-model:line1="state.line1"
          v-model:line2="state.line2"
          v-model:city-or-town="state.cityOrTown"
          v-model:post-code="state.postCode"
        />
      </div>
    </Variant>

    <Variant title="Required Fields">
      <div class="max-w-md">
        <AppAddress
          v-model:line1="state.line1"
          v-model:line2="state.line2"
          v-model:city-or-town="state.cityOrTown"
          v-model:post-code="state.postCode"
          :required="true"
        />
      </div>
    </Variant>
  </Story>
</template>
