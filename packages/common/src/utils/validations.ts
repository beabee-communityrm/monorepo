import { slug } from "./slug.js";
import { ContributionPeriod } from "../data/index.js";

/**
 * Check if the value is a valid angle.
 * @param value The value to check
 */
export const isAngle = (value: unknown, span = 180): value is number => {
  return typeof value === "number" && value >= (span * -1) && value <= span;
};

/**
 * Check if the value is a valid email address.
 * @param value The value to check
 * @param span The span of the angle
 */
export const isEmail = (value: unknown): value is string => {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Check if the value is a valid longitude/latitude pair.
 * @param value The value to check
 */
export const isLngLat = (value: unknown): value is [number, number] => {
  if (!Array.isArray(value) || value.length !== 2) {
    return false;
  }
  const [longitude, latitude] = value;

  // Longitude should be between -180 and 180 and latitude should be between -90 and 90
  if (!isAngle(longitude, 180) || !isAngle(latitude, 90)) {
    return false;
  }

  return true;
};

/**
 * Check if the value is a valid map bounds.
 * @param value The value to check
 */
export const isMapBounds = (
  value: unknown,
): value is [[number, number], [number, number]] => {
  return Array.isArray(value) && value.length === 2 && value.every(isLngLat);
};

/**
 * Check if the value is a valid password.
 * @param value The value to check
 */
export const isPassword = (value: unknown): value is string => {
  return (
    typeof value === "string" &&
    value.length >= 8 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /[0-9]/.test(value)
  );
};

/**
 * Check if the value is a valid period.
 * @param value The value to check
 */
export const isPeriod = (value: unknown): value is ContributionPeriod => {
  return (
    value === ContributionPeriod.Monthly ||
    value === ContributionPeriod.Annually
  );
};

/**
 * Check if the value is a valid slug.
 * @param value The value to check
 * @returns
 */
export const isSlug = (value: unknown): value is string => {
  return typeof value === "string" && value === slug(value);
};

/**
 * Check if the value is one of the given types
 * @param types The valid types
 * @param value The value to check
 */
export function isType(
  types: Array<
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function"
  >,
  value: unknown,
): boolean {
  return types.includes(typeof value);
}

/**
 * Check if the value is a valid URL string
 * @param value The value to check
 */
export const isURL = (value: unknown): value is string => {
  if (typeof value !== "string" || !value.length) {
    return false;
  }
  const urlRegex =
    /^(https?:\/\/)([\da-z\-]+\.)+[a-z]{2,6}(:[0-9]{1,5})?([\/\w \.-]*)*\/?(\?[a-zA-Z0-9=&]*)?$/;
  return urlRegex.test(value);
};

/**
 * Check if the value is a valid number
 * @param value The value to check
 */
export const isNumber = (value: unknown): value is number => {
  return typeof value === "number" && !isNaN(value);
};

export const isAmountOfMoney = (value: unknown): value is number => {
  if (!isNumber(value) || value < 0) {
    return false;
  }

  const decimalPart = value.toString().split(".")[1];
  // If the amount of money has decimal
  if (decimalPart && decimalPart.length > 2) {
    return false;
  }

  return true;
};

/**
 * Check if the value is a valid phone number with the following rules:
 * * Only uses numbers
 * * Optionally starts with a `+`
 * * Maximal length is 15 characters
 * * Minimal length is 5 characters
 * Note: This method is very generalised to work for as many countries as possible
 * and does not take into whitespace, brackets or other characters commonly used
 * in telephone number notation. To remove these, use `toPhoneNumber` instead.
 * @param value The value to check
 */
export const isPhoneNumber = (value: unknown): value is string => {
  if (typeof value !== "string" || !value.length) {
    return false;
  }
  if (value.length > 15 || value.length < 5) {
    return false;
  }
  const phoneRegex = /^(\+?[0-9])\d*$/;
  return phoneRegex.test(value);
};

/**
 * Check if the the pay fee value is correct for the given amount and period
 *
 * @param value The value to check
 * @param amount The amount
 * @param period The period
 */
export const isValidPayFee = (
  value: unknown,
  amount: unknown,
  period: unknown,
): value is boolean => {
  if (
    typeof value !== "boolean" ||
    typeof amount !== "number" ||
    !isPeriod(period)
  ) {
    return false;
  }

  // Annual contributions don't pay a fee
  if (value && period === ContributionPeriod.Annually) {
    return false;
  }
  // £1 monthly contributions must pay fee
  if (!value && period === ContributionPeriod.Monthly && amount === 1) {
    return false;
  }

  return true;
};

export const isNumberInRange = (
  value: unknown,
  min?: number,
  max?: number,
): boolean => {
  if (!isNumber(value)) {
    return false;
  }

  if (typeof min === "number") {
    if (value < min) {
      return false;
    }
  }

  if (typeof max === "number") {
    if (value > max) {
      return false;
    }
  }

  return true;
};

/**
 * Checks if a value is a string and its length is in a range
 * @param value The value to check
 * @param minLength The minimum length
 * @param maxLength The maximum length
 */
export const isTextInRange = (
  value: unknown,
  minLength = 0,
  maxLength?: number,
): boolean => {
  if (typeof value !== "string") {
    return false;
  }

  if (typeof minLength === "number" && value.length < minLength) {
    return false;
  }

  if (typeof maxLength === "number" && value.length > maxLength) {
    return false;
  }

  return true;
};

/**
 * Checks if a value is a string and its word length is in a range
 * @param value The value to check
 * @param minWordLength The minimum word length
 * @param maxWordLength The maximum word length
 */
export const isTextInWordRange = (
  value: unknown,
  minWordLength = 0,
  maxWordLength?: number,
): boolean => {
  if (typeof value !== "string") {
    return false;
  }

  const words = value.length > 0 ? value.split(" ") : [];

  if (typeof minWordLength === "number" && words.length < minWordLength) {
    return false;
  }

  if (typeof maxWordLength === "number" && words.length > maxWordLength) {
    return false;
  }

  return true;
};
