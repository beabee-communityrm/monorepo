<!--
  # AppCodeInput
  A segmented digit-entry input (`UPinInput`) with a built-in invalid-code
  ring state, shown while `error` is true. Used for confirmation codes (e.g.
  2FA setup/disable) where the code is validated by the server rather than
  client-side.

  Deliberately doesn't render an error message itself — where that belongs
  relative to surrounding content (e.g. right above action buttons, vs.
  directly under the boxes) varies per layout, so that's left to the caller.

  ## Props
  - `modelValue` (string[]): the entered digits, one per box. Use with `v-model`.
  - `length` (number, default 6): how many boxes to show.
  - `error` (boolean, default false): show the invalid-code ring.
  - `autofocus` (boolean, default false): focus the first box on mount.
-->
<template>
  <UPinInput
    :model-value="modelValue"
    class="mt-3 justify-center"
    :length="length"
    :color="error ? 'error' : undefined"
    :highlight="error"
    :autofocus="autofocus"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script lang="ts" setup>
/**
 * Segmented code input with a built-in invalid-code ring state.
 *
 * @component AppCodeInput
 */
export interface AppCodeInputProps {
  /** The entered digits, one per box */
  modelValue: string[];
  /** How many boxes to show */
  length?: number;
  /** Show the invalid-code ring state */
  error?: boolean;
  /** Focus the first box on mount */
  autofocus?: boolean;
}

withDefaults(defineProps<AppCodeInputProps>(), {
  length: 6,
  error: false,
  autofocus: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
}>();
</script>
