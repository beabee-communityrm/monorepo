/**
 * Groups an array of items by a key function
 * @param items The array of items to group
 * @param keyFn The function to generate the key for each item
 * @returns The grouped items as an object
 */
export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string
): { [key: string]: T[] | undefined } {
  const result: { [key: string]: T[] } = {};
  for (const item of items) {
    const value = keyFn(item);
    if (!result[value]) result[value] = [];
    result[value].push(item);
  }
  return result;
}

/**
 * Add a prefix to all keys in an object
 * @param prefix The prefix to add to each key
 * @param obj The object whose keys will be prefixed
 * @returns A new object with prefixed keys
 */
export function prefixKeys(
  prefix: string,
  obj: Record<string, unknown>
): Record<string, unknown> {
  const newObj: any = {};
  for (const key in obj) {
    newObj[`${prefix}${key}`] = obj[key];
  }
  return newObj;
}
