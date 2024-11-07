import { createQueryBuilder } from "@beabee/core/database";
import type { TagData } from "@beabee/beabee-common";
import type { TagAssignment, TaggableEntity } from "@beabee/core/type";

/**
 * Loads tags for a collection of entities using their assignment model.
 * This helper reduces code duplication for tag loading across different entity types.
 *
 * @template TAssignment - The type of the tag assignment (join table/model)
 * @template TEntity - The type of the entity that has tags
 *
 * @param entities - Array of entities to load tags for
 * @param AssignmentModel - The constructor for the tag assignment model (e.g., ContactTagAssignment)
 * @param entityIdField - The name of the foreign key field in the assignment model (e.g., "contactId")
 *
 * @example
 * // Loading tags for contacts
 * await loadEntityTags(contacts, ContactTagAssignment, "contactId");
 *
 * // Loading tags for callout responses
 * await loadEntityTags(responses, CalloutResponseTag, "responseId");
 */
export async function loadEntityTags<
  TTag extends TagData,
  TAssignment extends TagAssignment<TTag>,
  TEntity extends TaggableEntity<TTag>
>(
  entities: TEntity[],
  AssignmentModel: new () => TAssignment,
  entityIdField: string
): Promise<void> {
  if (entities.length === 0) return;

  const entityIds = entities.map((e) => e.id);

  // Load all tag assignments for the given entities in a single query
  const entityTags = (await createQueryBuilder(AssignmentModel, "et")
    .where(`et.${entityIdField} IN (:...ids)`, { ids: entityIds })
    .innerJoinAndSelect("et.tag", "tag")
    .getMany()) as TAssignment[];

  // Assign the tags to their respective entities
  for (const entity of entities) {
    entity.tags = entityTags.filter((et) => et[entityIdField] === entity.id);
  }
}
