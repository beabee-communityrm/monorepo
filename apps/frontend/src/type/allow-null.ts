/**
 * Allow null in place of possibly undefined fields, useful for create/update as
 * JSON serialisation removes undefined keys
 */
export type AllowNull<T> = {
  [P in keyof T]: undefined extends T[P] ? T[P] | null : T[P];
};
