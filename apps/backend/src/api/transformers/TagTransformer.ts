import { BaseTransformer } from "./BaseTransformer";
import { TransformPlainToInstance } from "class-transformer";
import {
  calloutTagFilters,
  contactTagFilters,
  RoleType
} from "@beabee/beabee-common";
import { ContactTag, CalloutTag } from "@beabee/core/models";
import { GetTagDto } from "@api/dto/TagDto";
import { GetCalloutTagDto } from "@api/dto/CalloutTagDto";
import { GetContactTagDto } from "@api/dto/ContactTagDto";
import { createQueryBuilder } from "@beabee/core/database";
import type { TagData } from "@beabee/beabee-common";
import type { TagAssignment, TaggableEntity } from "@beabee/core/type";

/**
 * Generic transformer for handling tag-related operations.
 * Provides functionality for converting tags and loading tag relationships.
 *
 * @template TModel - The tag model type extending TagData
 * @template TDto - The DTO type for tag responses, extending GetTagDto
 * @template TFilterName - The type for filter names
 *
 * @example
 * const calloutTagTransformer = new TagTransformer(
 *   CalloutTag,
 *   calloutTagFilters,
 *   GetCalloutTagDto
 * );
 */
class TagTransformer<
  TModel extends TagData,
  TDto extends GetTagDto,
  TFilterName extends string
> extends BaseTransformer<TModel, TDto, TFilterName> {
  /**
   * Creates a new TagTransformer instance.
   *
   * @param model - The constructor for the tag model
   * @param filters - Record of filters available for this tag type
   * @param dtoType - The constructor for the DTO class
   */
  constructor(
    protected model: any,
    protected filters: Record<TFilterName, any>,
    protected dtoType: new () => TDto
  ) {
    super();
  }

  /** Roles allowed to perform tag operations */
  protected allowedRoles: RoleType[] = ["admin"];

  /**
   * Converts a tag model instance to its DTO representation.
   *
   * @param tag - The tag model to convert
   * @returns The converted tag DTO containing id and name
   *
   * @example
   * const tagDto = transformer.convert(tagModel);
   * console.log(tagDto); // { id: "...", name: "..." }
   */
  @TransformPlainToInstance(GetTagDto)
  convert(tag: TModel): TDto {
    return {
      id: tag.id,
      name: tag.name
    } as TDto;
  }

  /**
   * Loads tags for a collection of entities using their assignment model.
   * This method efficiently loads all tags for multiple entities in a single query.
   *
   * @template TEntity - The type of the entity that has tags
   * @template TAssignment - The type of the tag assignment
   *
   * @param entities - Array of entities to load tags for
   * @param AssignmentModel - The constructor for the tag assignment model
   * @param entityIdField - The name of the foreign key field in the assignment model
   *
   * @example
   * // Loading tags for callout responses
   * await calloutTagTransformer.loadEntityTags(
   *   responses,
   *   CalloutResponseTag,
   *   "responseId"
   * );
   *
   * // After loading, each entity will have its tags property populated
   * console.log(responses[0].tags); // [{ tag: { id: "...", name: "..." }, responseId: "..." }]
   */
  async loadEntityTags<
    TEntity extends TaggableEntity<TModel>,
    TAssignment extends TagAssignment<TModel>
  >(
    entities: TEntity[],
    AssignmentModel: new () => TAssignment,
    entityIdField: string
  ): Promise<void> {
    if (entities.length === 0) return;

    const entityIds = entities.map((e) => e.id);

    const entityTags = (await createQueryBuilder(AssignmentModel, "et")
      .where(`et.${entityIdField} IN (:...ids)`, { ids: entityIds })
      .innerJoinAndSelect("et.tag", "tag")
      .getMany()) as TAssignment[];

    for (const entity of entities) {
      entity.tags = entityTags.filter((et) => et[entityIdField] === entity.id);
    }
  }
}

export const calloutTagTransformer = new TagTransformer(
  CalloutTag,
  calloutTagFilters,
  GetCalloutTagDto
);

export const contactTagTransformer = new TagTransformer(
  ContactTag,
  contactTagFilters,
  GetContactTagDto
);
