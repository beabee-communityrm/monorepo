import { FilterArgs } from "../types/index.ts";

export type Filters<T extends string = string> = Record<T, FilterArgs>;
