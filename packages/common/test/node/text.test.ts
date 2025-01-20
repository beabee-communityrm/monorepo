import { describe, expect, test } from "vitest";
import { isTextInRange, isTextInWordRange } from "@beabee/beabee-common";

describe("isTextInRange", () => {
  test("valid string within range", () => {
    expect(isTextInRange("Hello", 1, 10)).toBe(true);
  });

  test("valid string without range", () => {
    expect(isTextInRange("Hello")).toBe(true);
  });

  test("valid string at minimum length", () => {
    expect(isTextInRange("H", 1, 10)).toBe(true);
  });

  test("valid string at maximum length", () => {
    expect(isTextInRange("Hello World", 1, 11)).toBe(true);
  });

  test("invalid string below minimum length", () => {
    expect(isTextInRange("", 1, 10)).toBe(false);
  });

  test("invalid string above maximum length", () => {
    expect(isTextInRange("Hello World!", 1, 10)).toBe(false);
  });

  test("non-string value", () => {
    expect(isTextInRange(100, 1, 10)).toBe(false);
  });
});

describe("isTextInWordRange", () => {
  test("valid string at minimum word length", () => {
    expect(isTextInWordRange("Hello", 1)).toBe(true);
  });

  test("valid string without a word range", () => {
    expect(isTextInWordRange("Hello, how are you?")).toBe(true);
  });

  test("valid string at maximum word length", () => {
    expect(isTextInWordRange("Hello World", 1, 2)).toBe(true);
  });

  test("invalid string below minimum word length", () => {
    expect(isTextInWordRange("", 1)).toBe(false);
  });

  test("invalid string above maximum word length", () => {
    expect(isTextInWordRange("Hello World, baby!", 1, 2)).toBe(false);
  });

  test("non-string value", () => {
    expect(isTextInWordRange(100, 1, 10)).toBe(false);
  });
});
