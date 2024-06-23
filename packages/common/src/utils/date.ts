import {
  add,
  isValid,
  parseISO,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfSecond,
  startOfYear,
} from "../deps.ts";

import type { DateUnit, Duration, UnitMatches } from "../types/index.ts";

// Must be ordered from highest resolution to lowest (seconds to years)
export const dateUnits = ["s", "m", "h", "d", "M", "y"] as const;

export const dateUnitMap: Record<DateUnit, keyof Duration> = {
  y: "years",
  M: "months",
  d: "days",
  h: "hours",
  m: "minutes",
  s: "seconds",
};

const startOf: Record<DateUnit, (d: Date) => Date> = {
  y: startOfYear,
  M: startOfMonth,
  d: startOfDay,
  h: startOfHour,
  m: startOfMinute,
  s: startOfSecond,
};

const relativeDate = /^\$now(?<units>\(((y|M|d|h|m|s):(-?\d+),?)+\))?$/;
const relativeUnit = /(y|M|d|h|m|s):(-?\d+)/g;

// Matches the different parts of an ISO 8601 date. Note we don't validate the
// pattern properly as that is handled by parseISO, we just want to know which
// parts of the date were specified
const absoluteDate =
  /^(?<y>\d{4,})(-(?<M>\d\d)(-(?<d>\d\d)([T ](?<h>\d\d)(:(?<m>\d\d)(:(?<s>\d\d))?)?)?)?)?/;

// Convert relative dates and returns the minimum date unit specified
export function parseDate(value: string, now = new Date()): [Date, DateUnit] {
  let date: Date;
  let units: DateUnit[];

  const relativeMatch = relativeDate.exec(value);
  if (relativeMatch) {
    date = now;
    const unitsGroup = relativeMatch.groups?.units;
    if (unitsGroup) {
      const unitMatches = unitsGroup.matchAll(
        relativeUnit,
      ) as UnitMatches;
      units = [];
      for (const [_, unit, delta] of unitMatches) {
        date = add(date, { [dateUnitMap[unit]]: Number(delta) });
        units.push(unit);
      }
    } else {
      units = ["d"];
    }
  } else {
    date = parseISO(value);
    units = Object.entries(absoluteDate.exec(value)?.groups || {})
      .filter(([_, n]) => !!n)
      .map(([unit]) => unit) as DateUnit[];
  }

  const minUnit = getMinDateUnit(units) || "s";
  return [startOf[minUnit](date), minUnit];
}

export function getMinDateUnit(units: [DateUnit, ...DateUnit[]]): DateUnit;
export function getMinDateUnit(units: DateUnit[]): DateUnit | undefined;
export function getMinDateUnit(units: DateUnit[]): DateUnit | undefined {
  return dateUnits.find((unit) => units.includes(unit));
}

export function isValidDate(s: string | Date) {
  if (typeof s === "string") {
    return relativeDate.test(s) || isValid(parseISO(s));
  }
  return isValid(s);
}

export function isDateBetween(
  date: string | Date,
  start?: string | Date | null,
  end?: string | Date | null,
): boolean {
  let valid = isValidDate(date);
  if (start) {
    start = typeof start === "string" ? parseISO(start) : start;
    valid = valid && date >= start!;
  }
  if (end) {
    end = typeof end === "string" ? parseISO(end) : end;
    valid = valid && date <= end!;
  }
  return valid;
}
