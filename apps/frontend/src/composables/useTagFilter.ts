import type { RuleGroup } from '@beabee/beabee-common';

import { defineParam } from '#utils/pagination';

export function useTagFilter() {
  const currentTag = defineParam('tag', (v) => v || '');

  function createTagRule(tagId: string): RuleGroup {
    return {
      condition: 'AND',
      rules: [
        {
          field: 'tags',
          operator: 'contains',
          value: [tagId],
        },
      ],
    };
  }

  function addTagToRules(
    rules: RuleGroup[],
    tagId: string | undefined
  ): RuleGroup {
    if (!tagId) {
      return rules.length > 1
        ? { condition: 'AND', rules }
        : rules[0] || { condition: 'AND', rules: [] };
    }

    return {
      condition: 'AND',
      rules: [...rules, createTagRule(tagId)],
    };
  }

  return {
    currentTag,
    createTagRule,
    addTagToRules,
  };
}
