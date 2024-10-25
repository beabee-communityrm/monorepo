import type { Filters } from "./index.ts";

/**
 * Assert that the given filters are compatible with the expected filters.
 */
export type AssertFilters<T extends Filters> = T;
