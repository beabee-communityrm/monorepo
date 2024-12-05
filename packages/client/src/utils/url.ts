export const cleanUrl = (url: string): string => {
  return url.replaceAll("//", "/");
};

// deno-lint-ignore no-explicit-any
export function objToQueryString(obj: Record<string, any>): string {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        params.append(key, item);
      });
    } else if (value instanceof Date) {
      params.append(key, value.toISOString()); // Untested
    } else if (value === null) {
      params.append(key, "null"); // Untested
    } else if (typeof value === "object") {
      params.append(key, JSON.stringify(value));
    } else {
      if (value !== undefined) {
        params.append(key, value);
      }
    }
  });

  return params.toString();
}
