import { isNumber } from "@beabee/beabee-common";

describe("isNumber", () => {
  test("valid number", () => {
    expect(isNumber(123)).toBe(true);
  });

  test("invalid number - string", () => {
    expect(isNumber("123")).toBe(false);
  });

  test("invalid number - boolean", () => {
    expect(isNumber(true)).toBe(false);
  });

  test("invalid number - null", () => {
    expect(isNumber(null)).toBe(false);
  });

  test("invalid number - undefined", () => {
    expect(isNumber(undefined)).toBe(false);
  });

  test("invalid number - NaN", () => {
    expect(isNumber(NaN)).toBe(false);
  });
});
