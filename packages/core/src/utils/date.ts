export function createDateTime(date: string, time: string): Date;
export function createDateTime(
  date: string | undefined,
  time: string | undefined
): Date | null;
export function createDateTime(
  date: string | undefined,
  time: string | undefined
): Date | null {
  return date && time ? new Date(date + "T" + time) : null;
}
