<!--
  # AppCodeInput
  A segmented digit-entry input (`UPinInput`) with a built-in invalid-code
  ring state, shown while `error` is true. Used for confirmation codes (e.g.
  2FA setup/disable) where the code is validated by the server rather than
  client-side.

  Doesn't render an error message itself — wrap it in a
  `UFormField` and pass the message via its `error` prop, same as any other
  field.

  ## Props
  - `modelValue` ((number | undefined)[]): the entered digits, one per box —
    `undefined` for an empty box. Use with `v-model`.
  - `length` (number, default 6): how many boxes to show.
  - `error` (boolean, default false): show the invalid-code ring.
  - `autofocus` (boolean, default false): focus the first box on mount.

  Use `isCodeComplete` (from `utils/pin-input`) instead of `.length` to
  check the emitted `modelValue` for completeness.
-->
<template>
  <!--
    Reka UI's PinInput emits/accepts `number[]`, but a box can actually be
    `undefined` (backspaced) — hence the casts and `isCodeComplete` below.
  -->
  <UPinInput
    :model-value="modelValue as unknown as number[]"
    :length="length"
    type="number"
    :color="error ? 'error' : undefined"
    :highlight="error"
    :autofocus="autofocus"
    size="xl"
    @update:model-value="
      (value: (number | undefined)[]) => (modelValue = value)
    "
  />
</template>

<script lang="ts" setup>
/**
 * Segmented code input with a built-in invalid-code ring state.
 *
 * @component AppCodeInput
 */
export interface AppCodeInputProps {
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

/** The entered digits, one per box — `undefined` for an empty box */
const modelValue = defineModel<(number | undefined)[]>({ default: () => [] });
</script>
