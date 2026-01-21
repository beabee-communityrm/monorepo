import { RuleGroup } from './rule-group';

// Aggregation endpoints always only return the single aggregated values. 
// We do not need pagination on them.
export type GetPaymentsAggregationQuery = {
  rules?: RuleGroup;
};
