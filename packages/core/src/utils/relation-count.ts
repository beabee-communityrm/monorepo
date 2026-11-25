import { EntityTarget, ObjectLiteral } from 'typeorm';

import { createQueryBuilder } from '#database';

/**
 * Count the rows of a related entity per parent ID in a single grouped query.
 * Replaces `loadRelationCountAndMap`, which TypeORM 1.x removed.
 *
 * @param entity The related entity to count, e.g. CalloutResponse
 * @param foreignKey The property on the related entity holding the parent ID, e.g. 'calloutId'
 * @param parentIds The parent IDs to count for
 * @returns A map of parent ID to count; parents without related rows are absent
 */
export async function countRelatedByParentId<Entity extends ObjectLiteral>(
  entity: EntityTarget<Entity>,
  foreignKey: keyof Entity & string,
  parentIds: string[]
): Promise<Map<string, number>> {
  if (parentIds.length === 0) {
    return new Map();
  }

  const rows = await createQueryBuilder(entity, 'related')
    .select(`related.${foreignKey}`, 'parentId')
    .addSelect('COUNT(*)', 'count')
    .where(`related.${foreignKey} IN (:...parentIds)`, { parentIds })
    .groupBy(`related.${foreignKey}`)
    .getRawMany<{ parentId: string; count: string }>();

  // Postgres returns COUNT(*) as a string (bigint)
  return new Map(rows.map((row) => [row.parentId, Number(row.count)]));
}
