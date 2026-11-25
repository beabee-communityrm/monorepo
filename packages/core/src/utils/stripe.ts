import type Stripe from 'stripe';

/**
 * Splits a time range into consecutive windows of one calendar month, for
 * listing Stripe objects by creation time. Each window ends where the next
 * begins, so together they cover the range exactly once.
 *
 * Without `since` the first window has no start and without `until` the last
 * has no end, so objects older or newer than expected are still covered.
 *
 * @param oldest Where to start splitting if there is no `since`
 * @param now Where to stop splitting if there is no `until`
 * @param since The start of the range, if it is limited
 * @param until The end of the range, if it is limited
 * @returns The windows as Stripe `created` filters
 */
export function getCreatedWindows(
  oldest: Date,
  now: Date,
  since: Date | undefined,
  until: Date | undefined
): Stripe.RangeQueryParam[] {
  const from = since || oldest;
  const to = until || now;

  const windows: Stripe.RangeQueryParam[] = [];
  let start = since && Math.floor(since.getTime() / 1000);
  for (let month = from.getUTCMonth() + 1; ; month++) {
    const cut = Date.UTC(from.getUTCFullYear(), month, 1);
    if (cut >= to.getTime()) break;

    windows.push({
      ...(start !== undefined && { gte: start }),
      lt: cut / 1000,
    });
    start = cut / 1000;
  }
  windows.push({
    ...(start !== undefined && { gte: start }),
    ...(until && { lte: Math.floor(until.getTime() / 1000) }),
  });

  return windows;
}
