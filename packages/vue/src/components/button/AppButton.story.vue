<script lang="ts" setup>
import { ref } from "vue";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import AppButton from "./AppButton.vue";

const loading = ref(false);
</script>

<template>
  <Story title="Buttons/AppButton">
    <Variant title="Primary">
      <AppButton>Primary Button</AppButton>
    </Variant>

    <Variant title="Primary Outlined">
      <AppButton variant="primaryOutlined">Primary Outlined</AppButton>
    </Variant>

    <Variant title="With Icon">
      <AppButton :icon="faUser">With Icon</AppButton>
    </Variant>

    <Variant title="Loading State">
      <div class="flex gap-4">
        <AppButton :loading="loading">Loading Button</AppButton>
        <AppButton variant="primaryOutlined" @click="loading = !loading"
          >Toggle Loading</AppButton
        >
      </div>
    </Variant>

    <Variant title="Sizes">
      <div class="flex gap-4 items-center">
        <AppButton size="xs">Extra Small</AppButton>
        <AppButton size="sm">Small</AppButton>
        <AppButton size="md">Medium</AppButton>
        <AppButton size="lg">Large</AppButton>
      </div>
    </Variant>

    <Variant title="Variants">
      <div class="flex gap-4 flex-wrap">
        <AppButton variant="primary">Primary</AppButton>
        <AppButton variant="link">Link</AppButton>
        <AppButton variant="danger">Danger</AppButton>
        <AppButton variant="primaryOutlined">Primary Outlined</AppButton>
        <AppButton variant="linkOutlined">Link Outlined</AppButton>
        <AppButton variant="dangerOutlined">Danger Outlined</AppButton>
        <AppButton variant="greyOutlined">Grey Outlined</AppButton>
        <AppButton variant="text">Text</AppButton>
        <AppButton variant="dangerText">Danger Text</AppButton>
      </div>
    </Variant>
  </Story>
</template>
