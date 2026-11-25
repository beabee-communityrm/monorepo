import { describe, expect, it } from 'vitest';

import { getCreatedWindows } from './stripe.js';

describe('getCreatedWindows', () => {
  const seconds = (date: string) => new Date(date).getTime() / 1000;
  const now = new Date('2026-11-19T12:00:00Z');

  it('splits by calendar month with open ends', () => {
    expect(
      getCreatedWindows(
        new Date('2026-08-15T09:30:00Z'),
        now,
        undefined,
        undefined
      )
    ).toEqual([
      { lt: seconds('2026-09-01T00:00:00Z') },
      {
        gte: seconds('2026-09-01T00:00:00Z'),
        lt: seconds('2026-10-01T00:00:00Z'),
      },
      {
        gte: seconds('2026-10-01T00:00:00Z'),
        lt: seconds('2026-11-01T00:00:00Z'),
      },
      { gte: seconds('2026-11-01T00:00:00Z') },
    ]);
  });

  it('continues across a year end', () => {
    expect(
      getCreatedWindows(
        new Date('2025-12-10T00:00:00Z'),
        new Date('2026-01-20T00:00:00Z'),
        undefined,
        undefined
      )
    ).toEqual([
      { lt: seconds('2026-01-01T00:00:00Z') },
      { gte: seconds('2026-01-01T00:00:00Z') },
    ]);
  });

  it('closes the ends at since and until', () => {
    expect(
      getCreatedWindows(
        new Date('2020-01-01T00:00:00Z'),
        now,
        new Date('2026-09-20T00:00:00Z'),
        new Date('2026-10-05T00:00:00Z')
      )
    ).toEqual([
      {
        gte: seconds('2026-09-20T00:00:00Z'),
        lt: seconds('2026-10-01T00:00:00Z'),
      },
      {
        gte: seconds('2026-10-01T00:00:00Z'),
        lte: seconds('2026-10-05T00:00:00Z'),
      },
    ]);
  });

  it('returns one open window within a single month', () => {
    expect(
      getCreatedWindows(
        new Date('2026-11-02T00:00:00Z'),
        now,
        undefined,
        undefined
      )
    ).toEqual([{}]);
  });
});
