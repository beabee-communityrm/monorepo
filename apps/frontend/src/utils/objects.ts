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
