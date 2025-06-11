import { isType } from '@beabee/beabee-common';

import { describe, expect, test } from 'vitest';

describe('isType', () => {
  test('valid type - string', () => {
    expect(isType(['string'], 'string')).toBe(true);
  });

  test('valid type - number', () => {
    expect(isType(['number'], 1)).toBe(true);
  });

  test('valid type - object', () => {
    expect(isType(['object'], { foo: 'bar' })).toBe(true);
  });

  test('invalid type - date', () => {
    expect(isType(['string', 'number'], new Date())).toBe(false);
  });

  test('invalid type - null', () => {
    expect(isType(['string', 'number'], null)).toBe(false);
  });

  test('invalid type - undefined', () => {
    expect(isType(['string', 'number'], undefined)).toBe(false);
  });

  test('invalid type - array', () => {
    expect(isType(['string', 'number'], ['a', 'b'])).toBe(false);
  });
});
