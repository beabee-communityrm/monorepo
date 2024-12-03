import { isPhoneNumber } from "./validations.js";

/**
 * Convert the value to a valid phone number
 * @param value The value to convert
 * @returns The valid phone number or null if the value is not a valid phone number
 */
export const toPhoneNumber = (value: unknown): string | false => {
  if (typeof value !== "string" || !value.length) {
    return false;
  }
  const result = value.replace(/(?!^\+)\D/g, "");
  if (!isPhoneNumber(result)) {
    return false;
  }
  return result;
};

/**
 * Convert the value to a valid bytes number.
 * Note: This method ignores the text case of the unit, so b is always the same as B which means Byte and makes no different between Bytes and bits.
 * This method can be used to convert `fileMinSize` and `fileMaxSize` of a callout file component to bytes.
 * @param value E.g. "0KB", "1GB"
 * @returns The valid bytes number or null if the value is not a valid bytes number.
 */
export const toBytes = (value: unknown): number | null => {
  if (typeof value !== "string" || !value.length) {
    return null;
  }
  const lowerCase = value.toLowerCase();
  const units = ["b", "kb", "mb", "gb", "tb", "pb", "eb", "zb", "yb"];
  const [, num, unit] = lowerCase.match(/(\d+)(\w+)/)!;
  const unitIndex = units.indexOf(unit.toLowerCase());

  if (unitIndex === -1) {
    return null;
  }

  return Number(num) * Math.pow(1024, unitIndex);
};
