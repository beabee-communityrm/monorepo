import { DateUnit } from "./index.ts";

export type UnitMatches = IterableIterator<
  [string, DateUnit, string] & RegExpExecArray
>;
