import { describe, expect, test } from 'vitest';
import { Filters, InvalidRule, validateRule } from '@beabee/beabee-common';

const testFilters: Filters = {
  name: {
    type: 'text',
  },
  count: {
    type: 'number',
  },
  starts: {
    type: 'date',
    nullable: true,
  },
  period: {
    type: 'enum',
    options: ['monthly', 'annually'],
  },
  tags: {
    type: 'array',
  },
  hobbies: {
    type: 'array',
    options: ['football', 'knitting', 'music'],
  },
};

describe('validateRule should validate', () => {
  test('a basic rule', () => {
    expect(
      validateRule(testFilters, {
        field: 'name',
        operator: 'equal',
        value: ['foo'],
      })
    ).toEqual({
      type: 'text',
      field: 'name',
      nullable: false,
      operator: 'equal',
      value: ['foo'],
    });
  });

  test('a null operator on a non-nullable text filter', () => {
    expect(
      validateRule(testFilters, {
        field: 'name',
        operator: 'is_empty',
        value: [],
      })
    ).toBeTruthy();
  });

  test('a null operator on a nullable filter', () => {
    expect(
      validateRule(testFilters, {
        field: 'starts',
        operator: 'is_empty',
        value: [],
      })
    ).toBeTruthy();
  });

  test('a date filter with a valid absolute date', () => {
    expect(
      validateRule(testFilters, {
        field: 'starts',
        operator: 'greater',
        value: ['2022-12-01'],
      })
    ).toBeTruthy();
  });

  test('a date filter with a valid relative and absolute date', () => {
    expect(
      validateRule(testFilters, {
        field: 'starts',
        operator: 'between',
        value: ['2022-12-01', '$now(d:-1,M:-1)'],
      })
    ).toBeTruthy();
  });

  test('a select filter with a valid option', () => {
    expect(
      validateRule(testFilters, {
        field: 'period',
        operator: 'equal',
        value: ['monthly'],
      })
    ).toBeTruthy();
  });

  test('an array filter without defined options', () => {
    expect(
      validateRule(testFilters, {
        field: 'tags',
        operator: 'contains',
        value: ['expert'],
      })
    ).toBeTruthy();
  });

  test('an array filter with defined options', () => {
    expect(
      validateRule(testFilters, {
        field: 'hobbies',
        operator: 'contains',
        value: ['football'],
      })
    ).toBeTruthy();
  });
});

describe('validateRule should fail for', () => {
  test('an invalid field', () => {
    expect(() =>
      validateRule(testFilters, {
        field: 'unknown',
        operator: 'equal',
        value: ['test'],
      })
    ).toThrow(InvalidRule);
  });

  test('an invalid operator', () => {
    expect(() =>
      validateRule(testFilters, {
        field: 'name',
        operator: 'greater',
        value: [0],
      })
    ).toThrow(InvalidRule);
  });

  test('an invalid value type', () => {
    expect(() =>
      validateRule(testFilters, {
        field: 'name',
        operator: 'equal',
        value: [0],
      })
    ).toThrow(InvalidRule);
  });

  test('an invalid number of values', () => {
    expect(() =>
      validateRule(testFilters, {
        field: 'name',
        operator: 'equal',
        value: [],
      })
    ).toThrow(InvalidRule);
  });

  test('a null operator on non-nullable filter', () => {
    expect(() => {
      validateRule(testFilters, {
        field: 'count',
        operator: 'is_empty',
        value: [],
      });
    }).toThrow(InvalidRule);
  });

  test('a date filter with an invalid relative date', () => {
    expect(() =>
      validateRule(testFilters, {
        field: 'starts',
        operator: 'between',
        value: ['2022-12-01', '$now(d-1,M:-1)'],
      })
    ).toThrow(InvalidRule);
  });

  test('a select filter with an invalid option', () => {
    expect(() =>
      validateRule(testFilters, {
        field: 'period',
        operator: 'equal',
        value: ['weekly'],
      })
    ).toThrow(InvalidRule);
  });

  test('an array filter with an invalid option', () => {
    expect(() =>
      validateRule(testFilters, {
        field: 'hobbies',
        operator: 'contains',
        value: ['hockey'],
      })
    ).toThrow(InvalidRule);
  });
});
