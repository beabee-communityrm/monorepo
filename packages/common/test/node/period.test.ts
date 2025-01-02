import { isPeriod } from "@beabee/beabee-common";

describe("isPeriod", () => {
  test("valid period - monthly", () => {
    expect(isPeriod("monthly")).toBe(true);
  });

  test("valid period - annually", () => {
    expect(isPeriod("annually")).toBe(true);
  });

  test("invalid period - daily", () => {
    expect(isPeriod("daily")).toBe(false);
  });

  test("invalid period - empty string", () => {
    expect(isPeriod("")).toBe(false);
  });

  test("invalid period - null", () => {
    expect(isPeriod(null)).toBe(false);
  });
});
