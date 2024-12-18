import { isAngle } from "@beabee/beabee-common";

describe("isAngle", () => {
  test("valid angle - 0", () => {
    expect(isAngle(0)).toBe(true);
  });

  test("valid angle - 180", () => {
    expect(isAngle(180)).toBe(true);
  });

  test("valid angle - -180", () => {
    expect(isAngle(-180)).toBe(true);
  });

  test("invalid angle - 181", () => {
    expect(isAngle(181)).toBe(false);
  });

  test("invalid angle - -181", () => {
    expect(isAngle(-181)).toBe(false);
  });

  test("invalid angle - not a number", () => {
    expect(isAngle("not a number")).toBe(false);
  });
});
