import { describe, expect, test } from "vitest";
import { isURL } from "@beabee/beabee-common";

describe("isURL", () => {
  test("valid URL", () => {
    expect(isURL("https://beabee.io/")).toBe(true);
  });

  test("valid URL with www", () => {
    expect(isURL("https://www.beabee.io/")).toBe(true);
  });

  test("valid URL with path", () => {
    expect(isURL("https://beabee.io/path/to/resource")).toBe(true);
  });

  test("valid URL with query parameters", () => {
    expect(isURL("https://beabee.io/path?param1=value1&param2=value2")).toBe(
      true
    );
  });

  test("valid URL with port", () => {
    expect(isURL("https://beabee.io:8080")).toBe(true);
  });

  test("invalid URL missing protocol", () => {
    expect(isURL("beabee.io")).toBe(false);
  });

  test("invalid URL missing domain", () => {
    expect(isURL("https://")).toBe(false);
  });

  test("invalid URL with spaces", () => {
    expect(isURL("https://bea bee.io")).toBe(false);
  });

  test("invalid URL with multiple periods", () => {
    expect(isURL("https://beabee..io")).toBe(false);
  });
});
