<!--
  # ContactFilterToggle
  Segmented switch for picking one of a few options in the contact filters,
  such as all/any or yes/no.
-->
<template>
  <fieldset class="inline-flex rounded-lg border border-default bg-default p-1">
    <legend class="sr-only">{{ label }}</legend>
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      class="rounded-md px-3 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      :class="
        modelValue === option.value
          ? 'bg-primary/10 font-semibold text-primary ring ring-primary/25 ring-inset'
          : 'text-muted hover:text-default'
      "
      :aria-pressed="modelValue === option.value"
      @click="modelValue = option.value"
    >
      {{ option.label }}
    </button>
  </fieldset>
</template>

<script lang="ts" setup generic="T extends string | number | boolean">
defineProps<{
  /** Accessible name for the group, read before the options */
  label: string;
  /** The options to choose between, in display order */
  options: { value: T; label: string }[];
}>();

const modelValue = defineModel<T>({ required: true });
</script>
