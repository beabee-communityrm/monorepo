import { describe, expect, it } from 'vitest';

import { coerceToDate } from './coerce.js';

describe('coerceToDate', () => {
  const fixedNow = new Date('2024-01-15T12:00:00Z');

  it('should parse absolute ISO date strings', () => {
    const result = coerceToDate('2024-01-01T00:00:00Z', fixedNow);
    expect(result).toEqual(new Date('2024-01-01T00:00:00Z'));
  });

  it('should parse duration strings and subtract from now', () => {
    const result = coerceToDate('P7D', fixedNow); // 7 days ago
    expect(result).toEqual(new Date('2024-01-08T12:00:00Z'));
  });

  it('should handle complex duration strings', () => {
    const result = coerceToDate('P1M2D', fixedNow); // 1 month and 2 days ago
    expect(result).toEqual(new Date('2023-12-13T12:00:00Z'));
  });
});
