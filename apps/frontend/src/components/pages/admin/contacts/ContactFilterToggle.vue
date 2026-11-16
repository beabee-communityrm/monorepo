<!--
  # ContactFilterToggle
  Segmented switch for picking one of a few options in the contact filters,
  such as all/any or yes/no.

  Built from native radios rather than URadioGroup, whose variants don't
  offer this segmented style.
-->
<template>
  <fieldset class="inline-flex rounded-lg border border-default bg-default p-1">
    <legend class="sr-only">{{ label }}</legend>
    <label
      v-for="option in options"
      :key="String(option.value)"
      class="relative cursor-pointer rounded-md px-3 py-1 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary"
      :class="
        modelValue === option.value
          ? 'bg-primary/10 font-semibold text-primary ring ring-primary/25 ring-inset'
          : 'text-muted hover:text-default'
      "
    >
      <input
        v-model="modelValue"
        type="radio"
        :name="name"
        :value="option.value"
        class="sr-only"
      />
      {{ option.label }}
    </label>
  </fieldset>
</template>

<script lang="ts" setup generic="T extends string | number | boolean">
import { useId } from 'vue';

defineProps<{
  /** Accessible name for the group, read before the options */
  label: string;
  /** The options to choose between, in display order */
  options: { value: T; label: string }[];
}>();

const modelValue = defineModel<T>({ required: true });

const name = useId();
</script>
