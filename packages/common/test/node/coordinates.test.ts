import { isLngLat } from "@beabee/beabee-common";

describe("isLngLat test with", () => {
  test("a valid longitude/latitude pair", () => {
    expect(isLngLat([-73.935242, 40.73061])).toBe(true);
  });

  test("a valid longitude/latitude pair", () => {
    expect(isLngLat([-180, 90])).toBe(true);
  });

  test("a valid longitude/latitude pair at the edge of the valid range", () => {
    expect(isLngLat([-180, 90])).toBe(true);
  });

  test("a valid longitude/latitude pair at the other edge of the valid range", () => {
    expect(isLngLat([180, -90])).toBe(true);
  });

  test("an invalid longitude/latitude pair (longitude out of range)", () => {
    expect(isLngLat([-181, 40])).toBe(false);
  });

  test("an invalid longitude/latitude pair (latitude out of range)", () => {
    expect(isLngLat([-73, 91])).toBe(false);
  });

  test("an invalid longitude/latitude pair (both longitude and latitude out of range)", () => {
    expect(isLngLat([181, -91])).toBe(false);
  });

  test("an invalid longitude/latitude pair (not a number)", () => {
    expect(isLngLat(["not a number", 40])).toBe(false);
  });

  test("an invalid longitude/latitude pair (not a pair)", () => {
    expect(isLngLat([-73])).toBe(false);
  });
});
