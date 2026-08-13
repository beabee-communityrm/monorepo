/**
 * Whether every box has a digit entered (no empty/backspaced holes) —
 * see `AppCodeInput`, which uses this to check its own `modelValue`.
 */
export function isCodeComplete(
  digits: (number | undefined)[],
  length = 6
): boolean {
  return digits.filter((digit) => digit !== undefined).length === length;
}
