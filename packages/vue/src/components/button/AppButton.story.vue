<script lang="ts" setup>
import { ref, reactive } from 'vue';
import AppButton, {
  type ButtonVariant,
  type ButtonSize,
} from './AppButton.vue';
import { faUser, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const state = reactive({
  disabled: false,
  loading: false,
  variant: 'primary' as ButtonVariant,
  size: 'md' as ButtonSize,
  text: 'Button Text',
  icon: undefined,
});

const variants: ButtonVariant[] = [
  'primary',
  'link',
  'danger',
  'primaryOutlined',
  'linkOutlined',
  'dangerOutlined',
  'greyOutlined',
  'text',
  'dangerText',
];

const sizes: ButtonSize[] = ['xs', 'sm', 'md', 'lg'];

const icons = {
  none: undefined,
  user: faUser,
  edit: faEdit,
  trash: faTrash,
};
</script>

<template>
  <Story title="Components/Button/AppButton">
    <Variant title="Playground">
      <div class="flex flex-col gap-4">
        <AppButton
          :disabled="state.disabled"
          :loading="state.loading"
          :variant="state.variant"
          :size="state.size"
          :icon="state.icon"
        >
          {{ state.text }}
        </AppButton>
      </div>

      <template #controls>
        <HstText v-model="state.text" title="Button Text" />
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
          v-for="variant in variants"
          :key="variant"
          class="flex flex-col items-center gap-2"
        >
          <AppButton :variant="variant">{{ variant }}</AppButton>
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
        <AppButton :icon="faUser">With Icon</AppButton>
        <AppButton :icon="faEdit" variant="primaryOutlined">Edit</AppButton>
        <AppButton :icon="faTrash" variant="danger">Delete</AppButton>
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
