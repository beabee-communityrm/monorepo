import { MigrationInterface, QueryRunner } from 'typeorm';

type RuleOperator = string;
type RuleValue = string | number | boolean;

interface Rule {
  field: string;
  operator: RuleOperator;
  value: RuleValue | RuleValue[];
}

interface RuleGroup {
  condition: 'AND' | 'OR';
  rules: (Rule | RuleGroup)[];
}

interface Segment {
  [k: string]: unknown;
  id: string;
  ruleGroup: RuleGroup;
}

// Removes any extra properties on the group
function cleanRuleGroup(group: RuleGroup): RuleGroup {
  return {
    condition: group.condition,
    rules: group.rules.map((rule) =>
      'condition' in rule
        ? cleanRuleGroup(rule)
        : {
            field: rule.field,
            operator: rule.operator,
            value: rule.value,
          }
    ),
  };
}

export class FixSegmentRuleGroups1665070450970 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const segments = (await queryRunner.query(
      'SELECT * FROM "segment"'
    )) as Segment[];

    for (const segment of segments) {
      const newRuleGroup = cleanRuleGroup(segment.ruleGroup);
      await queryRunner.query(
        'UPDATE "segment" SET "ruleGroup" = $1 WHERE "id" = $2',
        [JSON.stringify(newRuleGroup), segment.id]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
