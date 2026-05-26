import { isEmail } from '@beabee/beabee-common';

import { describe, expect, test } from 'vitest';

describe('email validation', () => {
  test('valid email', () => {
    expect(isEmail('test@example.com')).toBe(true);
  });

  test('valid email with subdomain', () => {
    expect(isEmail('test@sub.example.com')).toBe(true);
  });

  test('valid email with number', () => {
    expect(isEmail('test123@example.com')).toBe(true);
  });

  test('valid email with hyphen', () => {
    expect(isEmail('test-test@example.com')).toBe(true);
  });

  test('valid email with underscore', () => {
    expect(isEmail('test_test@example.com')).toBe(true);
  });

  test('valid email with dot before @', () => {
    expect(isEmail('test.test@example.com')).toBe(true);
  });

  test('invalid email missing @', () => {
    expect(isEmail('testexample.com')).toBe(false);
  });

  test('invalid email missing domain', () => {
    expect(isEmail('test@')).toBe(false);
  });

  test('invalid email missing username', () => {
    expect(isEmail('@example.com')).toBe(false);
  });

  test('invalid email missing top-level domain', () => {
    expect(isEmail('test@example')).toBe(false);
  });

  test('invalid email contains spaces', () => {
    expect(isEmail('test @example.com')).toBe(false);
  });

  test('invalid email contains multiple @', () => {
    expect(isEmail('test@test@example.com')).toBe(false);
  });
});
