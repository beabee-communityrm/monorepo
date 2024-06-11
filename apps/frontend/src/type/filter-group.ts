import type { Component } from 'vue';
import type { FilterItems } from './filter-item';

export interface FilterGroup {
  id: string;
  label: string;
  items: FilterItems;
  custom?: Component;
  itemsMatch?: RegExp;
}

export type FilterGroups = FilterGroup[];
