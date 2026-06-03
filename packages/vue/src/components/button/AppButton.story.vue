<script lang="ts" setup>
import { reactive } from 'vue';

import AppButton, {
  type ButtonColor,
  type ButtonSize,
  type ButtonVariant,
} from './AppButton.vue';

const state = reactive({
  disabled: false,
  loading: false,
  color: 'primary' as ButtonColor,
  variant: 'solid' as ButtonVariant,
  size: 'md' as ButtonSize,
  text: 'Button Text',
  icon: undefined as string | undefined,
});

const colors: ButtonColor[] = ['primary', 'link', 'danger', 'neutral'];
const variants: ButtonVariant[] = [
  'solid',
  'outline',
  'ghost',
  'link',
  'soft',
  'subtle',
];
const sizes: ButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

const icons: Record<string, string | undefined> = {
  none: undefined,
  user: 'fa6-solid:user',
  edit: 'fa6-solid:pen-to-square',
  trash: 'fa6-solid:trash',
};
</script>

<template>
  <Story title="Button/AppButton">
    <Variant title="Playground">
      <div class="flex flex-col gap-4">
        <AppButton
          :disabled="state.disabled"
          :loading="state.loading"
          :color="state.color"
          :variant="state.variant"
          :size="state.size"
          :icon="state.icon"
        >
          {{ state.text }}
        </AppButton>
      </div>

      <template #controls>
        <HstText v-model="state.text" title="Button Text" />
        <HstSelect v-model="state.color" title="Color" :options="colors" />
        <HstSelect
          v-model="state.variant"
          title="Variant"
          :options="variants"
        />
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
        <HstSelect
          v-model="state.icon"
          title="Icon"
          :options="
            Object.entries(icons).map(([key, value]) => ({ label: key, value }))
          "
        />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstCheckbox v-model="state.loading" title="Loading" />
      </template>
    </Variant>

    <Variant title="Variants">
      <div class="grid grid-cols-3 gap-4">
        <div
          v-for="color in colors"
          :key="color"
          class="flex flex-col items-center gap-2"
        >
          <div v-for="variant in variants" :key="variant" class="flex gap-2">
            <AppButton :color="color" :variant="variant"
              >{{ color }}/{{ variant }}</AppButton
            >
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Sizes">
      <div class="flex items-end gap-4">
        <div
          v-for="size in sizes"
          :key="size"
          class="flex flex-col items-center gap-2"
        >
          <AppButton :size="size">{{ size }}</AppButton>
        </div>
      </div>
    </Variant>

    <Variant title="With Icons">
      <div class="flex gap-4">
        <AppButton icon="fa6-solid:user">With Icon</AppButton>
        <AppButton
          icon="fa6-solid:pen-to-square"
          color="primary"
          variant="outline"
          >Edit</AppButton
        >
        <AppButton icon="fa6-solid:trash" color="danger" variant="solid"
          >Delete</AppButton
        >
      </div>
    </Variant>

    <Variant title="States">
      <div class="flex gap-4">
        <AppButton>Normal</AppButton>
        <AppButton disabled>Disabled</AppButton>
        <AppButton loading>Loading</AppButton>
      </div>
    </Variant>

    <Variant title="As Link">
      <div class="flex gap-4">
        <AppButton href="https://example.com">Internal Link</AppButton>
        <AppButton href="https://example.com" external>External Link</AppButton>
        <AppButton to="/">Router Link</AppButton>
      </div>
    </Variant>
  </Story>
</template>
