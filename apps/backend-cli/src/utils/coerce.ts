import moment from 'moment';

/**
 * Accepts either an ISO date or duration string (starting with 'P') and returns
 * a Date object.
 *
 * Allows for either relative or absolute date specifications:
 * - "2024-01-01T00:00:00Z" for absolute dates
 * - "P7D" for 7 days ago
 *
 * @param arg
 */
export function coerceToDate(arg: string, now: Date = new Date()): Date {
  if (arg.startsWith('P')) {
    const duration = moment.duration(arg);
    return moment(now).subtract(duration).toDate();
  } else {
    return new Date(arg);
  }
}
