import { describe, expect, test } from 'vitest';
import { isAmountOfMoney } from '@beabee/beabee-common';

describe('isAmountOfMoney', () => {
  test('valid amount of money - positive integer', () => {
    expect(isAmountOfMoney(100)).toBe(true);
  });

  test('valid amount of money - positive float with two decimal places', () => {
    expect(isAmountOfMoney(100.5)).toBe(true);
  });

  test('invalid amount of money - negative integer', () => {
    expect(isAmountOfMoney(-100)).toBe(false);
  });

  test('invalid amount of money - positive float with more than two decimal places', () => {
    expect(isAmountOfMoney(100.505)).toBe(false);
  });

  test('invalid amount of money - non-number value', () => {
    expect(isAmountOfMoney('100')).toBe(false);
  });
});
