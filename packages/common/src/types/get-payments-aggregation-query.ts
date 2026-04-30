import { type RuleGroup } from './rule-group.js';

// Aggregation endpoints always only return the single aggregated values.
// We do not need pagination on them.
export type GetPaymentsAggregationQuery = {
  rules?: RuleGroup;
};
