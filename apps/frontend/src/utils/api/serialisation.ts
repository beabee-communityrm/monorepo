import { parseISO } from 'date-fns';

/** @deprecated Use the '@beabee/client' package instead */
export function deserializeDate(s: string): Date;
export function deserializeDate<T extends null | undefined>(
  s: string | T
): Date | T;
export function deserializeDate<T extends null | undefined>(
  s: string | T
): Date | T {
  return s == null ? s : parseISO(s);
}
