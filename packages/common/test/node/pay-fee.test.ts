import { describe, expect, test } from 'vitest';
import { isValidPayFee } from '@beabee/beabee-common';

describe('isValidPayFee', () => {
  test('valid pay fee - monthly with fee', () => {
    expect(isValidPayFee(true, 1, 'monthly')).toBe(true);
  });

  test('valid pay fee - annually without fee', () => {
    expect(isValidPayFee(false, 1, 'annually')).toBe(true);
  });

  test('invalid pay fee - annually with fee', () => {
    expect(isValidPayFee(true, 1, 'annually')).toBe(false);
  });

  test('invalid pay fee - monthly without fee', () => {
    expect(isValidPayFee(false, 1, 'monthly')).toBe(false);
  });

  test('invalid pay fee - non-boolean value', () => {
    expect(isValidPayFee('true', 1, 'monthly')).toBe(false);
  });

  test('invalid pay fee - non-number amount', () => {
    expect(isValidPayFee(true, '1', 'monthly')).toBe(false);
  });

  test('invalid pay fee - invalid period', () => {
    expect(isValidPayFee(true, 1, 'daily')).toBe(false);
  });
});
