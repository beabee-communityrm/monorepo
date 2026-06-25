export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    (result[key] ??= []).push(item);
  }
  return result;
}

export function setKey(
  obj: Record<string, unknown>,
  key: string,
  value: unknown
): void {
  const path = key.split('.');
  let i = 0;
  for (; i < path.length - 1; i++) {
    const p = path[i];
    if (obj[p] === undefined) {
      obj[p] = {};
    }
    obj = obj[p] as Record<string, unknown>;
  }
  obj[path[i]] = value;
}
