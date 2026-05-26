import moment from 'moment';

const iso8601DurationRegex =
  /^P(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?$/;

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
  if (iso8601DurationRegex.test(arg)) {
    const duration = moment.duration(arg);
    return moment(now).subtract(duration).toDate();
  } else {
    const date = moment(arg, true).toDate();
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date string: ${arg}`);
    }
    return date;
  }
}
