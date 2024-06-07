import {
  type EnumFilterArgs,
  type ArrayFilterArgs,
  type OtherFilterArgs,
  type FilterType,
  type RuleValue,
  operatorsByType,
  type Rule,
  operatorsByTypeMap,
  type RuleOperator,
  type RuleGroup,
  isRuleGroup,
} from '@beabee/beabee-common';
import type { Ref } from 'vue';
import type {
  FilterItemEnum,
  FilterItemArray,
  FilterItemOther,
  FilterItem,
  RuleGroupWithEmpty,
  FilterItems,
} from '@type';

interface LabelOpts {
  prefix: string;
}

export function withLabel<T extends readonly string[]>(
  args: EnumFilterArgs<T>,
  label: string,
  optionLabels: Record<T[number], string>
): FilterItemEnum<T>;
export function withLabel(
  args: ArrayFilterArgs<undefined>,
  label: string,
  opts?: LabelOpts
): FilterItemArray<undefined>;
export function withLabel<T extends readonly string[]>(
  args: ArrayFilterArgs<T>,
  label: string,
  optionLabels: Record<T[number], string>
): FilterItemArray<T>;
export function withLabel(
  args: OtherFilterArgs,
  label: string,
  opts?: LabelOpts
): FilterItemOther;
export function withLabel<T extends readonly string[]>(
  args: EnumFilterArgs<T> | ArrayFilterArgs<T> | OtherFilterArgs,
  label: string,
  extraArg?: Record<T[number], string> | LabelOpts
): FilterItem {
  if (args.type === 'enum' || (args.type === 'array' && args.options)) {
    const optionLabels = extraArg as Record<T[number], string>;
    return {
      ...args,
      label,
      options: (args.options || []).map((id: T[number]) => ({
        id,
        label: optionLabels[id],
      })),
    };
  } else {
    const args2 = args as OtherFilterArgs | ArrayFilterArgs<undefined>;
    const opts = extraArg as LabelOpts | undefined;
    return { ...args2, label, ...opts };
  }
}

export function withItems<T extends string, S extends T>(
  items: Ref<FilterItems<T>>,
  itemIds: S[]
): FilterItems<S> {
  const ret: Partial<FilterItems<S>> = {};
  for (const id of itemIds) {
    ret[id] = items.value[id];
  }
  return ret as FilterItems<S>;
}

export function getDefaultRuleValue(type: FilterType): RuleValue {
  switch (type) {
    case 'boolean':
      return true;
    case 'number':
      return 0;
    default:
      return '';
  }
}

// Enforces type safety for the operator and initial values
function withDefault<T extends FilterType>(
  type: T,
  operator: keyof (typeof operatorsByType)[T]
): Pick<Rule, 'operator' | 'value'> {
  const params = operatorsByTypeMap[type][operator as RuleOperator];
  return {
    operator: operator as RuleOperator,
    value: new Array(params?.args || 0).fill(getDefaultRuleValue(type)),
  };
}

const ruleDefaultsByType: Record<
  FilterType,
  () => Pick<Rule, 'operator' | 'value'>
> = {
  text: () => withDefault('text', 'equal'),
  blob: () => withDefault('blob', 'contains'),
  number: () => withDefault('number', 'equal'),
  enum: () => withDefault('enum', 'equal'),
  boolean: () => withDefault('boolean', 'equal'),
  contact: () => withDefault('contact', 'equal'),
  date: () => withDefault('date', 'equal'),
  array: () => withDefault('array', 'contains'),
};

export function createNewRule(field: string, type: FilterType): Rule {
  return {
    field,
    ...ruleDefaultsByType[type](),
  };
}

export function copyRule(rule: Rule): Rule {
  return {
    field: rule.field,
    operator: rule.operator,
    value: [...rule.value],
  };
}

export function copyRuleGroup(ruleGroup: RuleGroup): RuleGroup {
  return {
    condition: ruleGroup.condition,
    rules: ruleGroup.rules.map((ruleOrGroup) =>
      isRuleGroup(ruleOrGroup)
        ? copyRuleGroup(ruleOrGroup)
        : copyRule(ruleOrGroup)
    ),
  };
}

export function isRuleEqual(a: Rule, b: Rule): boolean {
  return (
    a.field === b.field &&
    a.operator === b.operator &&
    a.value.length === b.value.length &&
    a.value.every((v, i) => v === b.value[i])
  );
}

export function isRuleGroupEqual(
  a: RuleGroupWithEmpty,
  b: RuleGroupWithEmpty
): boolean {
  return (
    a.condition === b.condition &&
    a.rules.length === b.rules.length &&
    a.rules.every((ra, i) => {
      const rb = b.rules[i];
      if (ra === null || rb === null) return ra === rb;

      const raGroup = isRuleGroup(ra);
      const rbGroup = isRuleGroup(rb);
      return (
        raGroup === rbGroup &&
        (raGroup
          ? isRuleGroupEqual(ra, rb as RuleGroup)
          : isRuleEqual(ra, rb as Rule))
      );
    })
  );
}
