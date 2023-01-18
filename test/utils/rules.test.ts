import { describe, expect, test } from "@jest/globals";
import { Filters, InvalidRule, Rule, validateRule } from "../../src";

const testFilters = {
  name: {
    type: "text",
  },
  count: {
    type: "number",
  },
  starts: {
    type: "date",
    nullable: true,
  },
} satisfies Filters;

describe("validateRule should validate", () => {
  test("a basic rule", () => {
    expect(
      validateRule(testFilters, {
        field: "name",
        operator: "equal",
        value: ["foo"],
      })
    ).toEqual({
      type: "text",
      field: "name",
      operator: "equal",
      param: undefined,
      value: ["foo"],
    });
  });

  test("a null operator on a non-nullable text filter", () => {
    expect(
      validateRule(testFilters, {
        field: "name",
        operator: "is_empty",
        value: [],
      })
    ).toBeTruthy();
  });

  test("a null operator on a nullable filter", () => {
    expect(
      validateRule(testFilters, {
        field: "starts",
        operator: "is_empty",
        value: [],
      })
    ).toBeTruthy();
  });

  test("a rule with a parameter", () => {
    expect(
      validateRule(testFilters, {
        field: "name.bar",
        operator: "begins_with",
        value: ["foo"],
      })
    ).toEqual({
      type: "text",
      field: "name",
      param: "bar",
      operator: "begins_with",
      value: ["foo"],
    });
  });

  test("a date filter with a valid absolute date", () => {
    expect(
      validateRule(testFilters, {
        field: "starts",
        operator: "greater",
        value: ["2022-12-01"],
      })
    ).toBeTruthy();
  });

  test("a date filter with a valid relative and absolute date", () => {
    expect(
      validateRule(testFilters, {
        field: "starts",
        operator: "between",
        value: ["2022-12-01", "$now(d:-1,M:-1)"],
      })
    ).toBeTruthy();
  });
});

describe("validateRule should fail for", () => {
  test("an invalid field", () => {
    expect(() =>
      validateRule(testFilters, {
        field: "unknown",
        operator: "equal",
        value: ["test"],
      })
    ).toThrow(InvalidRule);
  });

  test("an invalid operator", () => {
    expect(() =>
      validateRule(testFilters, {
        field: "name",
        operator: "greater",
        value: [0],
      })
    ).toThrow(InvalidRule);
  });

  test("an invalid value type", () => {
    expect(() =>
      validateRule(testFilters, {
        field: "name",
        operator: "equal",
        value: [0],
      })
    ).toThrow(InvalidRule);
  });

  test("an invalid number of values", () => {
    expect(() =>
      validateRule(testFilters, {
        field: "name",
        operator: "equal",
        value: [],
      })
    ).toThrow(InvalidRule);
  });

  test("a null operator on non-nullable filter", () => {
    expect(() => {
      validateRule(testFilters, {
        field: "count",
        operator: "is_empty",
        value: [],
      });
    }).toThrow(InvalidRule);
  });

  test("a date filter with an invalid relative date", () => {
    expect(() =>
      validateRule(testFilters, {
        field: "starts",
        operator: "between",
        value: ["2022-12-01", "$now(d-1,M:-1)"],
      })
    ).toThrow(InvalidRule);
  });
});
