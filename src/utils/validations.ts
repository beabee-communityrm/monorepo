/**
 * Check if the value is a valid email address.
 * @param value The value to check
 */
export const isEmail = (value: unknown) => {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Check if the value is a valid URL string
 * @param value The value to check
 */
export const isURL = (value: unknown) => {
  if (typeof value !== "string" || !value.length) {
    return false;
  }
  const urlRegex =
    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  return urlRegex.test(value);
};
