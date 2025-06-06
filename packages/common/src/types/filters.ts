import type { FilterArgs } from '../types/index.js';

export type Filters<T extends string = string> = Record<T, FilterArgs>;
