// Dates are serialized in API response
export type Serial<T> = {
  [P in keyof T]: Date extends T[P]
    ? string
    : Date | undefined extends T[P]
      ? string | undefined
      : Date | null extends T[P]
        ? string | null
        : T[P];
};
