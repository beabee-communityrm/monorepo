<script lang="ts" setup>
import type { CalloutMapSchemaIconStylingAnswerIconDefinition } from '@beabee/beabee-common';

import { computed, reactive, ref } from 'vue';

import AppIconPicker, {
  type AppIconPickerIconStyle,
} from './AppIconPicker.vue';

const GRID_LIMIT = 15;
const PLAYGROUND_LIMIT_DEFAULT = 25;

/** Styles we have Font Awesome packages for in this workspace. */
const STYLE_OPTIONS: AppIconPickerIconStyle[] = ['solid', 'regular', 'brands'];

/** Normalize HstSelect value (may be option object) to icon style string. */
function toIconStyle(value: unknown): AppIconPickerIconStyle {
  if (typeof value === 'string') return value;
  const v = (value as { value?: AppIconPickerIconStyle })?.value;
  return v ?? 'solid';
}

const state = reactive<{
  modelValue: CalloutMapSchemaIconStylingAnswerIconDefinition;
  limit: number;
  style: AppIconPickerIconStyle | string;
}>({
  modelValue: { prefix: 'fas', name: 'map-marker-alt' },
  limit: PLAYGROUND_LIMIT_DEFAULT,
  style: 'solid',
});

const styleValue = computed(() => toIconStyle(state.style));

const modelValueSolid = ref<CalloutMapSchemaIconStylingAnswerIconDefinition>({
  prefix: 'fas',
  name: 'map-marker-alt',
});
const modelValueRegular = ref<CalloutMapSchemaIconStylingAnswerIconDefinition>({
  prefix: 'far',
  name: 'heart',
});
const modelValueBrands = ref<CalloutMapSchemaIconStylingAnswerIconDefinition>({
  prefix: 'fab',
  name: 'osi',
});
</script>

<template>
  <Story title="Form/AppIconPicker">
    <Variant title="Playground">
      <div class="max-w-xl space-y-4">
        <AppIconPicker
          id="icon-picker-playground"
          v-model="state.modelValue"
          :limit="state.limit"
          :icon-style="styleValue"
        />
        <p class="text-sm text-body-80">
          Selected:
          <code>{{ state.modelValue.prefix }} {{ state.modelValue.name }}</code>
        </p>
      </div>

      <template #controls>
        <HstText v-model="state.modelValue.prefix" title="Selected prefix" />
        <HstText v-model="state.modelValue.name" title="Selected name" />
        <HstNumber v-model="state.limit" title="Limit" :min="5" :max="50" />
        <HstSelect
          v-model="state.style"
          title="Style"
          :options="STYLE_OPTIONS"
        />
      </template>
    </Variant>

    <Variant title="Solid icons (default)">
      <div class="max-w-xl">
        <AppIconPicker
          id="icon-picker-solid"
          v-model="modelValueSolid"
          icon-style="solid"
          initial-search-query="location"
          :limit="GRID_LIMIT"
        />
      </div>
    </Variant>

    <Variant title="Regular icons (outlined)">
      <div class="max-w-xl">
        <AppIconPicker
          id="icon-picker-regular"
          v-model="modelValueRegular"
          icon-style="regular"
          initial-search-query="love"
          :limit="GRID_LIMIT"
        />
      </div>
    </Variant>

    <Variant title="Brands icons">
      <div class="max-w-xl">
        <AppIconPicker
          id="icon-picker-brands"
          v-model="modelValueBrands"
          icon-style="brands"
          initial-search-query="open"
          :limit="GRID_LIMIT"
        />
      </div>
    </Variant>
  </Story>
</template>

<docs lang="md">
- **Playground**: Use the controls to change style, limit and selected icon. Only styles with registered icons in this workspace are listed (solid, regular, brands).
- **Solid / Regular / Brands**: One style per variant, each with its own selection and default search query (location, love, open).
</docs>
