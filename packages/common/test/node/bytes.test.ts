import { toBytes } from "@beabee/beabee-common";

describe("toBytes", () => {
  test("valid bytes conversion", () => {
    expect(toBytes("1KB")).toBe(1024);
  });

  test("valid bytes conversion with different units", () => {
    expect(toBytes("1MB")).toBe(1024 * 1024);
  });

  test("valid bytes conversion with large units", () => {
    expect(toBytes("1GB")).toBe(1024 * 1024 * 1024);
  });

  test("invalid bytes conversion", () => {
    expect(toBytes("1AB")).toBe(null);
  });

  test("empty string", () => {
    expect(toBytes("")).toBe(null);
  });

  test("non-string value", () => {
    expect(toBytes(100)).toBe(null);
  });
});
