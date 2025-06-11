/**
 * A fast way to check if a string is maybe a json string
 * @param str
 * @returns
 */
export const maybeJsonString = (str?: string | null): str is string => {
  if (!str || typeof str !== 'string') {
    return false;
  }
  str = str.trim();
  return (
    (str.charAt(0) === '{' && str.charAt(str.length - 1) === '}') ||
    (str.charAt(0) === '[' && str.charAt(str.length - 1) === ']')
  );
};

/**
 * Test if string is a json string
 * @param str
 */
export const isJson = (str?: string | null) => {
  if (!maybeJsonString(str)) {
    return false;
  }
  try {
    const val = JSON.parse(str);
    return Array.isArray(val) || typeof val === 'object' ? true : false;
  } catch (_) {
    return false;
  }
};
