import type { Rule, RuleGroup, RuleValue } from '@beabee/beabee-common';

import { MigrationInterface, QueryRunner } from 'typeorm';

import { ContactTag } from '../models/ContactTag';
import { Segment } from '../models/Segment';

export class MigrateSegmentTagRules1731670066414 implements MigrationInterface {
  name = 'MigrateSegmentTagRules1731670066414';

  private isUuid(value: RuleValue): boolean {
    return (
      typeof value === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value
      )
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Starting segment tag rules migration...');

    const segments = await queryRunner.manager.find(Segment);
    const tags = await queryRunner.manager.find(ContactTag);

    let migratedCount = 0;
    let skippedCount = 0;

    const filterDeletedRules = (
      rules: (Rule | RuleGroup)[]
    ): (Rule | RuleGroup)[] => {
      return rules.filter((rule) => {
        if ('field' in rule) {
          if (rule.value.includes('__DELETE_ME__')) {
            return false;
          }
        } else {
          rule.rules = filterDeletedRules(rule.rules);
        }
        return true;
      });
    };

    for (const segment of segments) {
      try {
        let modified = false;
        const ruleGroup = segment.ruleGroup;

        const processRules = (
          rules: (Rule | RuleGroup)[]
        ): (Rule | RuleGroup)[] => {
          for (const rule of rules) {
            if ('field' in rule) {
              if (
                rule.field === 'tags' &&
                Array.isArray(rule.value) &&
                rule.value.length > 0
              ) {
                const hasNonUuidValues = rule.value.some(
                  (value) => !this.isUuid(value)
                );

                if (hasNonUuidValues) {
                  rule.value = rule.value.map((value) => {
                    const tagName = String(value);
                    const tag = tags.find((t) => t.name === tagName);
                    if (tag) {
                      modified = true;
                      return tag.id;
                    }
                    console.warn(
                      `Tag not found: ${tagName} in segment: ${segment.id}`
                    );
                    modified = true;
                    return '__DELETE_ME__';
                  });
                }
              }
            } else {
              rule.rules = processRules(rule.rules);
            }
          }

          return filterDeletedRules(rules);
        };

        ruleGroup.rules = processRules(ruleGroup.rules);

        if (modified) {
          await queryRunner.manager.update(
            Segment,
            { id: segment.id },
            { ruleGroup }
          );
          migratedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error processing segment ${segment.id}:`, error);
        throw error;
      }
    }

    console.log(
      `Migration completed. Migrated: ${migratedCount}, Skipped: ${skippedCount}`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Starting rollback of segment tag rules...');

    const segments = await queryRunner.manager.find(Segment);
    const tags = await queryRunner.manager.find(ContactTag);

    let rolledBackCount = 0;
    let skippedCount = 0;

    for (const segment of segments) {
      try {
        let modified = false;
        const ruleGroup = segment.ruleGroup;

        const processRules = (rules: (Rule | RuleGroup)[]): void => {
          for (const rule of rules) {
            if ('field' in rule) {
              // Handle Rule type
              if (
                rule.field === 'tags' &&
                Array.isArray(rule.value) &&
                rule.value.length > 0
              ) {
                rule.value = rule.value.map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId);
                  if (tag) {
                    modified = true;
                    return tag.name;
                  }
                  console.warn(
                    `Tag ID not found: ${tagId} in segment: ${segment.id}`
                  );
                  return tagId;
                });
              }
            } else {
              // Handle RuleGroup type
              processRules(rule.rules);
            }
          }
        };

        processRules(ruleGroup.rules);

        if (modified) {
          await queryRunner.manager.update(
            Segment,
            { id: segment.id },
            { ruleGroup }
          );
          rolledBackCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error rolling back segment ${segment.id}:`, error);
        throw error;
      }
    }

    console.log(
      `Rollback completed. Rolled back: ${rolledBackCount}, Skipped: ${skippedCount}`
    );
  }
}
