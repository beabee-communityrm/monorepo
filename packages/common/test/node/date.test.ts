import { assertEquals } from "https://deno.land/std@0.212.0/assert/assert_equals.ts";
import {
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfSecond,
  startOfYear,
  sub,
} from "date-fns";

import { getMinDateUnit, isValidDate, parseDate } from "../../mod.ts";

Deno.test("parseDate for absolute dates", async (t) => {
  await t.step("date with years has unit years", () => {
    assertEquals(parseDate("2022"), [new Date(2022, 0), "y"]);
  });
  await t.step("date with months has unit months", () => {
    assertEquals(parseDate("2022-02"), [new Date(2022, 1), "M"]);
  });
  await t.step("date with days has unit days", () => {
    assertEquals(parseDate("2022-03-03"), [new Date(2022, 2, 3), "d"]);
  });
  await t.step("date with hours has unit hours", () => {
    assertEquals(parseDate("2022-03-03T10"), [new Date(2022, 2, 3, 10), "h"]);
  });
  await t.step("date with minutes has unit minutes", () => {
    assertEquals(parseDate("2022-03-03T10:50"), [
      new Date(2022, 2, 3, 10, 50),
      "m",
    ]);
  });
  await t.step("date with seconds has unit seconds", () => {
    assertEquals(parseDate("2022-03-03T10:50:25"), [
      new Date(2022, 2, 3, 10, 50, 25),
      "s",
    ]);
  });
  await t.step("date with ms has unit seconds", () => {
    assertEquals(parseDate("2022-03-03T10:50:25.123"), [
      new Date(2022, 2, 3, 10, 50, 25),
      "s",
    ]);
  });
});

Deno.test("parseDate for relative dates", async (t) => {
  const now = new Date();

  await t.step("$now has unit days", () => {
    assertEquals(parseDate("$now", now), [startOfDay(now), "d"]);
  });
  await t.step("$now - years has unit years", () => {
    assertEquals(parseDate("$now(y:-1)", now), [
      startOfYear(sub(now, { years: 1 })),
      "y",
    ]);
  });
  await t.step("$now - months has unit months", () => {
    assertEquals(parseDate("$now(M:-1)", now), [
      startOfMonth(sub(now, { months: 1 })),
      "M",
    ]);
    assertEquals(parseDate("$now(y:-2,M:-1)", now), [
      startOfMonth(sub(now, { years: 2, months: 1 })),
      "M",
    ]);
  });
  await t.step("$now - days has unit days", () => {
    assertEquals(parseDate("$now(d:-1)", now), [
      startOfDay(sub(now, { days: 1 })),
      "d",
    ]);
    assertEquals(parseDate("$now(y:-1,d:-1)", now), [
      startOfDay(sub(now, { years: 1, days: 1 })),
      "d",
    ]);
    assertEquals(parseDate("$now(y:-1,M:-3,d:-1)", now), [
      startOfDay(sub(now, { years: 1, months: 3, days: 1 })),
      "d",
    ]);
  });
  await t.step("$now - hours has unit hours", () => {
    assertEquals(parseDate("$now(h:-1)", now), [
      startOfHour(sub(now, { hours: 1 })),
      "h",
    ]);
    assertEquals(parseDate("$now(y:-2,h:-1)", now), [
      startOfHour(sub(now, { years: 2, hours: 1 })),
      "h",
    ]);
  });
  await t.step("$now - minutes has unit minutes", () => {
    assertEquals(parseDate("$now(m:-1)", now), [
      startOfMinute(sub(now, { minutes: 1 })),
      "m",
    ]);
    assertEquals(parseDate("$now(y:-1,m:-1)", now), [
      startOfMinute(sub(now, { years: 1, minutes: 1 })),
      "m",
    ]);
  });
  await t.step("$now - seconds has unit seconds", () => {
    assertEquals(parseDate("$now(s:-1)", now), [
      startOfSecond(sub(now, { seconds: 1 })),
      "s",
    ]);
    assertEquals(parseDate("$now(y:-1,s:-1)", now), [
      startOfSecond(sub(now, { years: 1, seconds: 1 })),
      "s",
    ]);
  });

  await t.step("parseDate returns invalid date on bad input", () => {
    const [date] = parseDate("Not a date");
    assertEquals(isNaN(+date), true);
  });

  await t.step("getMinDateUnit returns minimum date unit", () => {
    assertEquals(getMinDateUnit(["d", "m"]), "m");
    assertEquals(getMinDateUnit(["d", "y"]), "d");
    assertEquals(getMinDateUnit(["d", "y", "h", "s"]), "s");
  });
});

Deno.test("isValidDate", async (t) => {
  await t.step("recognises valid absolute dates", () => {
    assertEquals(isValidDate("2022-12-01"), true);
    assertEquals(isValidDate("2022-12-01T10:00"), true);
    assertEquals(isValidDate("2022-12-01T10:00:00"), true);

    assertEquals(isValidDate("2022-12-01T10:"), false);
  });

  await t.step("recognises valid relative dates", () => {
    assertEquals(isValidDate("$now(d:-1)"), true);
    assertEquals(isValidDate("$now(d:1)"), true);
    assertEquals(isValidDate("$now(d:1,M:-1)"), true);

    assertEquals(isValidDate("$n"), false);
    assertEquals(isValidDate("$now(d-1,M:-1)"), false);
    assertEquals(isValidDate("$now(d-1,M:-1)"), false);
  });
});
