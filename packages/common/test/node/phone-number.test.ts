import { describe, expect, test } from 'vitest';
import { toPhoneNumber } from '@beabee/beabee-common';

describe('toPhoneNumber', () => {
  test('valid phone number starting with +', () => {
    expect(toPhoneNumber('+1234567890')).not.toBe(false);
  });

  test('valid phone number starting with 0', () => {
    expect(toPhoneNumber('01234567890')).not.toBe(false);
  });

  test('valid phone number with country code and spaces', () => {
    expect(toPhoneNumber('+1 234 567 890')).not.toBe(false);
  });

  test('valid phone number with country code and dashes', () => {
    expect(toPhoneNumber('+1-234-567-890')).not.toBe(false);
  });

  test('valid phone number with parentheses', () => {
    expect(toPhoneNumber('(123) 456-7890')).not.toBe(false);
  });

  test('valid phone number with country code, parentheses and spaces', () => {
    expect(toPhoneNumber('+1 (234) 567 890')).not.toBe(false);
  });

  test('valid phone number with country code, parentheses and dashes', () => {
    expect(toPhoneNumber('+1 (234)-567-890')).not.toBe(false);
  });

  test('valid phone number with german country code +49', () => {
    expect(toPhoneNumber('+494721 56789')).not.toBe(false);
  });

  test('invalid phone number - string', () => {
    expect(toPhoneNumber('123')).toBe(false);
  });

  test('invalid phone number - boolean', () => {
    expect(toPhoneNumber(true)).toBe(false);
  });

  test('invalid phone number - null', () => {
    expect(toPhoneNumber(null)).toBe(false);
  });

  test('invalid phone number - undefined', () => {
    expect(toPhoneNumber(undefined)).toBe(false);
  });
});
