<script lang="ts" setup>
import ActionButton from './ActionButton.vue';
import AppButton, {
  type ButtonVariant,
  type ButtonColor,
} from './AppButton.vue';
import AppButtonGroup from './AppButtonGroup.vue';

const colors: ButtonColor[] = ['primary', 'link', 'danger', 'neutral'];
const variants: ButtonVariant[] = ['solid', 'outline', 'ghost', 'link'];
</script>

<template>
  <Story title="Button/AppButtonGroup">
    <Variant title="Basic">
      <AppButtonGroup>
        <AppButton color="primary" variant="outline">Button 1</AppButton>
        <AppButton color="primary" variant="outline">Button 2</AppButton>
        <AppButton color="primary" variant="outline">Button 3</AppButton>
      </AppButtonGroup>
    </Variant>

    <Variant title="With Icons">
      <AppButtonGroup>
        <AppButton color="primary" variant="outline" icon="fa6-solid:user"
          >User 1</AppButton
        >
        <AppButton color="primary" variant="outline" icon="fa6-solid:user"
          >User 2</AppButton
        >
        <AppButton color="primary" variant="outline" icon="fa6-solid:user"
          >User 3</AppButton
        >
      </AppButtonGroup>
    </Variant>

    <Variant title="Different Variants">
      <div class="flex flex-col gap-4">
        <div
          v-for="combo in colors.flatMap((c) =>
            variants.map((v) => ({
              color: c as ButtonColor,
              variant: v as ButtonVariant,
            }))
          )"
          :key="`${combo.color}-${combo.variant}`"
          class="flex flex-col gap-1"
        >
          <span class="text-grey-500 text-sm"
            >{{ combo.color }}/{{ combo.variant }}</span
          >
          <AppButtonGroup>
            <AppButton :color="combo.color" :variant="combo.variant"
              >Left</AppButton
            >
            <AppButton :color="combo.color" :variant="combo.variant"
              >Middle</AppButton
            >
            <AppButton :color="combo.color" :variant="combo.variant"
              >Right</AppButton
            >
          </AppButtonGroup>
        </div>
      </div>
    </Variant>

    <Variant title="With Action Buttons">
      <AppButtonGroup>
        <ActionButton icon="fa6-solid:pen-to-square">Edit</ActionButton>
        <ActionButton icon="fa6-solid:trash">Delete</ActionButton>
        <ActionButton icon="fa6-solid:plus">Add</ActionButton>
      </AppButtonGroup>
    </Variant>

    <Variant title="Toolbar Example">
      <div class="rounded bg-grey-lighter p-4">
        <AppButtonGroup>
          <AppButton color="primary" variant="solid" icon="fa6-solid:plus"
            >New</AppButton
          >
          <AppButton
            color="primary"
            variant="outline"
            icon="fa6-solid:pen-to-square"
            >Edit</AppButton
          >
          <AppButton color="primary" variant="outline" icon="fa6-solid:download"
            >Download</AppButton
          >
          <AppButton color="primary" variant="outline" icon="fa6-solid:upload"
            >Upload</AppButton
          >
          <AppButton color="danger" variant="solid" icon="fa6-solid:trash"
            >Delete</AppButton
          >
        </AppButtonGroup>
      </div>
    </Variant>
  </Story>
</template>
