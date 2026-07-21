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
  <!--
    `type="number"` restricts input to digits (numeric keyboard, rejects
    non-digit chars), but in this mode Reka UI's PinInput stores filled
    boxes as actual numbers and, on backspace, `delete`s the array slot
    instead of setting it to '' — leaving a sparse hole that doesn't
    shrink `.length`. `handleUpdate` below normalizes both quirks back
    into a plain, correctly-sized string[], hence the casts.
  -->
  <UPinInput
    :model-value="modelValue as unknown as number[]"
    :length="length"
    type="number"
    :color="error ? 'error' : undefined"
    :highlight="error"
    :autofocus="autofocus"
    size="xl"
    @update:model-value="handleUpdate"
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

/**
 * Converts filled boxes to strings and deleted (sparse-hole) boxes to '',
 * then trims trailing empty boxes so `.length` reflects digits actually
 * entered.
 */
const handleUpdate = (value: (number | undefined)[]) => {
  const digits = [...value].map((digit) =>
    digit === undefined ? '' : String(digit)
  );
  while (digits.at(-1) === '') {
    digits.pop();
  }
  emit('update:modelValue', digits);
};
</script>
