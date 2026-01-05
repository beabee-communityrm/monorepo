import { describe, expect, it } from 'vitest';

import { groupBy, prefixKeys } from './objects';

describe('groupBy', () => {
  it('should group items by string key', () => {
    const items = [
      { name: 'Alice', role: 'admin' },
      { name: 'Bob', role: 'user' },
      { name: 'Charlie', role: 'admin' },
      { name: 'David', role: 'user' },
    ];

    const result = groupBy(items, (item) => item.role);

    expect(result).toEqual({
      admin: [
        { name: 'Alice', role: 'admin' },
        { name: 'Charlie', role: 'admin' },
      ],
      user: [
        { name: 'Bob', role: 'user' },
        { name: 'David', role: 'user' },
      ],
    });
  });

  it('should handle empty array', () => {
    const result = groupBy([], (item: any) => item.key);
    expect(result).toEqual({});
  });

  it('should handle single item', () => {
    const items = [{ id: 1, category: 'electronics' }];
    const result = groupBy(items, (item) => item.category);

    expect(result).toEqual({
      electronics: [{ id: 1, category: 'electronics' }],
    });
  });

  it('should group by numeric key converted to string', () => {
    const items = [
      { value: 10, level: 1 },
      { value: 20, level: 2 },
      { value: 30, level: 1 },
      { value: 40, level: 3 },
    ];

    const result = groupBy(items, (item) => item.level.toString());

    expect(result).toEqual({
      '1': [
        { value: 10, level: 1 },
        { value: 30, level: 1 },
      ],
      '2': [{ value: 20, level: 2 }],
      '3': [{ value: 40, level: 3 }],
    });
  });

  it('should group primitive values', () => {
    const numbers = [1, 2, 3, 1, 2, 4, 1];
    const result = groupBy(numbers, (num) => (num % 2 === 0 ? 'even' : 'odd'));

    expect(result).toEqual({
      odd: [1, 3, 1, 1],
      even: [2, 2, 4],
    });
  });

  it('should handle items with undefined/null properties', () => {
    const items = [
      { name: 'Alice', role: 'admin' },
      { name: 'Bob', role: undefined },
      { name: 'Charlie', role: null },
      { name: 'David', role: 'user' },
    ];

    const result = groupBy(items, (item) => item.role?.toString() || 'unknown');

    expect(result).toEqual({
      admin: [{ name: 'Alice', role: 'admin' }],
      unknown: [
        { name: 'Bob', role: undefined },
        { name: 'Charlie', role: null },
      ],
      user: [{ name: 'David', role: 'user' }],
    });
  });
});

describe('prefixKeys', () => {
  it('should add prefix to all keys', () => {
    const obj = {
      name: 'John',
      age: 30,
      active: true,
    };

    const result = prefixKeys('user_', obj);

    expect(result).toEqual({
      user_name: 'John',
      user_age: 30,
      user_active: true,
    });
  });

  it('should handle empty object', () => {
    const result = prefixKeys('prefix_', {});
    expect(result).toEqual({});
  });

  it('should handle empty prefix', () => {
    const obj = { key1: 'value1', key2: 'value2' };
    const result = prefixKeys('', obj);

    expect(result).toEqual({
      key1: 'value1',
      key2: 'value2',
    });
  });

  it('should handle object with various value types', () => {
    const obj = {
      string: 'text',
      number: 42,
      boolean: false,
      array: [1, 2, 3],
      object: { nested: 'value' },
      null: null,
      undefined: undefined,
    };

    const result = prefixKeys('test_', obj);

    expect(result).toEqual({
      test_string: 'text',
      test_number: 42,
      test_boolean: false,
      test_array: [1, 2, 3],
      test_object: { nested: 'value' },
      test_null: null,
      test_undefined: undefined,
    });
  });

  it('should handle numeric and special character keys', () => {
    const obj = {
      '123': 'numeric key',
      'key-with-dash': 'dash value',
      'key.with.dots': 'dots value',
      'key with spaces': 'spaces value',
    };

    const result = prefixKeys('app_', obj);

    expect(result).toEqual({
      app_123: 'numeric key',
      'app_key-with-dash': 'dash value',
      'app_key.with.dots': 'dots value',
      'app_key with spaces': 'spaces value',
    });
  });

  it('should not modify the original object', () => {
    const original = { name: 'test', value: 123 };
    const originalCopy = { ...original };

    prefixKeys('new_', original);

    expect(original).toEqual(originalCopy);
  });
});
