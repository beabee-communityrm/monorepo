<script lang="ts" setup>
import { faUser } from "@fortawesome/free-solid-svg-icons";
import AppButtonGroup from "./AppButtonGroup.vue";
import AppButton from "./AppButton.vue";
</script>

<template>
  <Story title="Buttons/AppButtonGroup">
    <Variant title="Basic">
      <AppButtonGroup>
        <AppButton variant="primaryOutlined">Button 1</AppButton>
        <AppButton variant="primaryOutlined">Button 2</AppButton>
        <AppButton variant="primaryOutlined">Button 3</AppButton>
      </AppButtonGroup>
    </Variant>

    <Variant title="With Icons">
      <AppButtonGroup>
        <AppButton variant="primaryOutlined" :icon="faUser">User 1</AppButton>
        <AppButton variant="primaryOutlined" :icon="faUser">User 2</AppButton>
        <AppButton variant="primaryOutlined" :icon="faUser">User 3</AppButton>
      </AppButtonGroup>
    </Variant>
  </Story>
</template>
