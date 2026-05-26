import { describe, expect, it } from 'vitest';

import { coerceToDate } from './coerce.js';

describe('coerceToDate', () => {
  const fixedNow = new Date('2024-01-15T12:00:00Z');

  it('should parse absolute ISO date strings', () => {
    const result = coerceToDate('2024-01-01T00:00:00Z', fixedNow);
    expect(result).toEqual(new Date('2024-01-01T00:00:00Z'));
  });

  it('should parse duration strings and subtract from now', () => {
    const result = coerceToDate('P7D', fixedNow);
    expect(result).toEqual(new Date('2024-01-08T12:00:00Z'));
  });

  it('should handle complex duration strings', () => {
    const result = coerceToDate('P1M2DT2H', fixedNow);
    expect(result).toEqual(new Date('2023-12-13T10:00:00Z'));
  });

  it('should parse 0 duration to return now', () => {
    const result = coerceToDate('P0D', fixedNow);
    expect(result).toEqual(new Date('2024-01-15T12:00:00Z'));
  });

  it('should throw an error for invalid date strings', () => {
    expect(() => coerceToDate('invalid-date', fixedNow)).toThrow();
  });

  it('should throw an error for invalid duration strings', () => {
    expect(() => coerceToDate('PXD', fixedNow)).toThrow();
  });
});
