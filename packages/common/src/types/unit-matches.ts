import { type DateUnit } from './index.js';

export type UnitMatches = IterableIterator<
  [string, DateUnit, string] & RegExpExecArray
>;
