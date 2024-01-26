import { slug } from "./slug.ts";
import { ContributionPeriod } from "../data/index.ts";

/**
 * Check if the value is a valid angle.
 * @param value The value to check
 */
export const isAngle = (value: unknown): value is number => {
  return typeof value === "number" && value >= -180 && value <= 180;
};

/**
 * Check if the value is a valid email address.
 * @param value The value to check
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

  if (!isAngle(longitude) || !isAngle(latitude)) {
    return false;
  }

  // Longitude should be between -180 and 180 which is tested with `isAngle`.
  // Latitude should be between -90 and 90
  if (latitude < -90 || latitude > 90) {
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
    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  return urlRegex.test(value);
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
