import {
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfSecond,
  startOfYear,
  sub
} from "date-fns";
import { getMinDateUnit, isValidDate, parseDate } from "@beabee/beabee-common";

describe("parseDate for absolute dates", () => {
  test("date with years has unit years", () => {
    expect(parseDate("2022")).toEqual([new Date(2022, 0), "y"]);
  });

  test("date with months has unit months", () => {
    expect(parseDate("2022-02")).toEqual([new Date(2022, 1), "M"]);
  });

  test("date with days has unit days", () => {
    expect(parseDate("2022-03-03")).toEqual([new Date(2022, 2, 3), "d"]);
  });

  test("date with hours has unit hours", () => {
    expect(parseDate("2022-03-03T10")).toEqual([new Date(2022, 2, 3, 10), "h"]);
  });

  test("date with minutes has unit minutes", () => {
    expect(parseDate("2022-03-03T10:50")).toEqual([
      new Date(2022, 2, 3, 10, 50),
      "m"
    ]);
  });

  test("date with seconds has unit seconds", () => {
    expect(parseDate("2022-03-03T10:50:25")).toEqual([
      new Date(2022, 2, 3, 10, 50, 25),
      "s"
    ]);
  });

  test("date with ms has unit seconds", () => {
    expect(parseDate("2022-03-03T10:50:25.123")).toEqual([
      new Date(2022, 2, 3, 10, 50, 25),
      "s"
    ]);
  });
});

describe("parseDate for relative dates", () => {
  const now = new Date();

  test("$now has unit days", () => {
    expect(parseDate("$now", now)).toEqual([startOfDay(now), "d"]);
  });

  test("$now - years has unit years", () => {
    expect(parseDate("$now(y:-1)", now)).toEqual([
      startOfYear(sub(now, { years: 1 })),
      "y"
    ]);
  });

  test("$now - months has unit months", () => {
    expect(parseDate("$now(M:-1)", now)).toEqual([
      startOfMonth(sub(now, { months: 1 })),
      "M"
    ]);
    expect(parseDate("$now(y:-2,M:-1)", now)).toEqual([
      startOfMonth(sub(now, { years: 2, months: 1 })),
      "M"
    ]);
  });

  test("$now - days has unit days", () => {
    expect(parseDate("$now(d:-1)", now)).toEqual([
      startOfDay(sub(now, { days: 1 })),
      "d"
    ]);
    expect(parseDate("$now(y:-1,d:-1)", now)).toEqual([
      startOfDay(sub(now, { years: 1, days: 1 })),
      "d"
    ]);
    expect(parseDate("$now(y:-1,M:-3,d:-1)", now)).toEqual([
      startOfDay(sub(now, { years: 1, months: 3, days: 1 })),
      "d"
    ]);
  });

  test("$now - hours has unit hours", () => {
    expect(parseDate("$now(h:-1)", now)).toEqual([
      startOfHour(sub(now, { hours: 1 })),
      "h"
    ]);
    expect(parseDate("$now(y:-2,h:-1)", now)).toEqual([
      startOfHour(sub(now, { years: 2, hours: 1 })),
      "h"
    ]);
  });

  test("$now - minutes has unit minutes", () => {
    expect(parseDate("$now(m:-1)", now)).toEqual([
      startOfMinute(sub(now, { minutes: 1 })),
      "m"
    ]);
    expect(parseDate("$now(y:-1,m:-1)", now)).toEqual([
      startOfMinute(sub(now, { years: 1, minutes: 1 })),
      "m"
    ]);
  });

  test("$now - seconds has unit seconds", () => {
    expect(parseDate("$now(s:-1)", now)).toEqual([
      startOfSecond(sub(now, { seconds: 1 })),
      "s"
    ]);
    expect(parseDate("$now(y:-1,s:-1)", now)).toEqual([
      startOfSecond(sub(now, { years: 1, seconds: 1 })),
      "s"
    ]);
  });
});

describe("parseDate validation", () => {
  test("parseDate returns invalid date on bad input", () => {
    const [date] = parseDate("Not a date");
    expect(isNaN(+date)).toBe(true);
  });

  test("getMinDateUnit returns minimum date unit", () => {
    expect(getMinDateUnit(["d", "m"])).toBe("m");
    expect(getMinDateUnit(["d", "y"])).toBe("d");
    expect(getMinDateUnit(["d", "y", "h", "s"])).toBe("s");
  });
});

describe("isValidDate", () => {
  test("recognises valid absolute dates", () => {
    expect(isValidDate("2022-12-01")).toBe(true);
    expect(isValidDate("2022-12-01T10:00")).toBe(true);
    expect(isValidDate("2022-12-01T10:00:00")).toBe(true);

    expect(isValidDate("2022-12-01T10:")).toBe(false);
  });

  test("recognises valid relative dates", () => {
    expect(isValidDate("$now(d:-1)")).toBe(true);
    expect(isValidDate("$now(d:1)")).toBe(true);
    expect(isValidDate("$now(d:1,M:-1)")).toBe(true);

    expect(isValidDate("$n")).toBe(false);
    expect(isValidDate("$now(d-1,M:-1)")).toBe(false);
    expect(isValidDate("$now(d-1,M:-1)")).toBe(false);
  });
});
