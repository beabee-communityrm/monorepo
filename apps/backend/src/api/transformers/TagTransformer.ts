import { BaseTransformer } from "./BaseTransformer";
import { TransformPlainToInstance } from "class-transformer";
import {
  calloutTagFilters,
  contactTagFilters,
  RoleType
} from "@beabee/beabee-common";
import {
  ContactTag,
  CalloutTag,
  CalloutResponseTag,
  ContactTagAssignment
} from "@beabee/core/models";
import { GetTagDto } from "@api/dto/TagDto";
import { GetCalloutTagDto } from "@api/dto/CalloutTagDto";
import { GetContactTagDto } from "@api/dto/ContactTagDto";
import { createQueryBuilder } from "@beabee/core/database";
import type {
  CalloutTagFilterName,
  ContactTagFilterName,
  Filters,
  PaginatedQuery,
  TagData
} from "@beabee/beabee-common";
import type { TagAssignment, TaggableEntity } from "@beabee/core/type";
import { getRepository } from "@beabee/core/database";
import { NotFoundError } from "routing-controllers";
import { FilterHandler } from "@type/filter-handlers";
import { AuthInfo } from "@type/auth-info";
import { getReviewerRules } from "./BaseCalloutResponseTransformer";
import { mergeRules } from "@api/utils";
import { UnauthorizedError } from "@beabee/core/errors";

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
abstract class TagTransformer<
  TModel extends TagData,
  TDto extends GetTagDto,
  TFilterName extends string
> extends BaseTransformer<TModel, TDto, TFilterName> {
  /** The constructor for the DTO class */
  protected abstract dtoType: new () => TDto;
  /** The tag assignment table */
  protected abstract assignmentModel: new () => TagAssignment<TModel>;
  /** The name of the foreign key field in the assignment model */
  protected abstract entityIdField: keyof TagAssignment<TModel>;

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
   *
   * @param entities - Array of entities to load tags for
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
  async loadEntityTags(entities: TaggableEntity<TModel>[]): Promise<void> {
    if (entities.length === 0) return;

    const entityIds = entities.map((e) => e.id);

    const entityTags = (await createQueryBuilder(this.assignmentModel, "et")
      .where(`et.${this.entityIdField} IN (:...ids)`, { ids: entityIds })
      .innerJoinAndSelect("et.tag", "tag")
      .orderBy("tag.name", "ASC")
      .getMany()) as TagAssignment<TModel>[];

    for (const entity of entities) {
      entity.tags = entityTags.filter(
        (et) => et[this.entityIdField] === entity.id
      );
    }
  }

  /**
   * Updates tags for an entity or multiple entities.
   * Handles adding and removing tags based on prefix (+ or -).
   *
   * @param entityIds - Array of entity IDs to update tags for
   * @param tagUpdates - Array of tag updates (e.g., ["+tagId1", "-tagId2"])
   *
   * @example
   * await calloutTagTransformer.updateEntityTags(
   *   responseIds,
   *   ["+tag1", "-tag2"],
   *   CalloutResponseTag,
   *   "response"
   * );
   */
  async updateEntityTags(
    entityIds: string[],
    tagUpdates: string[],
    AssignmentModel: new () => any,
    entityField: string
  ): Promise<void> {
    const addTags = tagUpdates
      .filter((tag) => tag.startsWith("+"))
      .flatMap((tag) =>
        entityIds.map((id) => ({
          [entityField]: { id },
          tag: { id: tag.slice(1) }
        }))
      );

    const removeTags = tagUpdates
      .filter((tag) => tag.startsWith("-"))
      .flatMap((tag) =>
        entityIds.map((id) => ({
          [entityField]: { id },
          tag: { id: tag.slice(1) }
        }))
      );

    if (addTags.length > 0) {
      await createQueryBuilder()
        .insert()
        .into(AssignmentModel)
        .values(addTags)
        .orIgnore()
        .execute();
    }
    if (removeTags.length > 0) {
      await createQueryBuilder()
        .delete()
        .from(AssignmentModel)
        .where(removeTags)
        .execute();
    }
  }

  /**
   * Helper method to extract tag updates from update data
   *
   * @param data - Update data containing tags and other fields
   * @returns Object containing tag updates and other updates separately
   */
  protected getUpdateData<T extends { tags?: string[] }>(
    data: T
  ): {
    tagUpdates: string[] | undefined;
    otherUpdates: Omit<T, "tags">;
  } {
    const { tags: tagUpdates, ...otherUpdates } = data;
    return { tagUpdates, otherUpdates };
  }

  /**
   * Creates a new tag
   *
   * @param data - Tag creation data containing name and optional description
   * @returns Created tag
   *
   * @example
   * const tag = await contactTagTransformer.create({
   *   name: "Important",
   *   description: "For important contacts"
   * });
   */
  async create(data: Partial<TModel>): Promise<TModel> {
    const { name, description, ...rest } = data;
    const tag = await getRepository(this.model).save({
      ...rest,
      name,
      description: description || ""
    } as TModel);
    return tag;
  }

  /**
   * Updates an existing tag
   *
   * @param id - Tag ID
   * @param data - Tag update data
   * @throws NotFoundError if tag doesn't exist
   *
   * @example
   * await contactTagTransformer.update(tagId, {
   *   name: "New Name",
   *   description: "Updated description"
   * });
   */
  async update(id: string, data: Partial<TModel>): Promise<void> {
    const result = await getRepository(this.model).update(id, data);
    if (result.affected === 0) {
      throw new NotFoundError();
    }
  }

  /**
   * Deletes a tag and its assignments
   *
   * @param id - Tag ID
   * @param AssignmentModel - The tag assignment model to clean up
   * @throws NotFoundError if tag doesn't exist
   *
   * @example
   * await contactTagTransformer.delete(tagId, ContactTagAssignment);
   */
  async delete(id: string): Promise<void> {
    // Check if tag exists
    const tag = await getRepository(this.model).findOneBy({ id });
    if (!tag) {
      throw new NotFoundError();
    }

    // Delete any assignments first
    await getRepository(this.assignmentModel).delete({ tag: { id } });

    // Delete tag
    const result = await getRepository(this.model).delete(id);
    if (!result.affected) {
      throw new NotFoundError();
    }
  }

  /**
   * Creates a filter handler for tag-based filtering using the transformer's configuration
   *
   * @returns A filter handler for tag-based queries
   */
  public tagFilterHandler: FilterHandler = (qb, args) => {
    const subQb = createQueryBuilder()
      .subQuery()
      .select(`ta.${this.entityIdField}`)
      .from(this.assignmentModel, "ta");

    if (args.operator === "contains" || args.operator === "not_contains") {
      subQb.where(args.addParamSuffix("ta.tagId = :valueA"));
    }

    const inOp =
      args.operator === "not_contains" || args.operator === "is_empty"
        ? "NOT IN"
        : "IN";

    qb.where(`${args.fieldPrefix}id ${inOp} ${subQb.getQuery()}`);

    return args.operator === "contains" || args.operator === "not_contains"
      ? { valueA: args.value[0] }
      : {};
  };
}

class CalloutTagTransformer extends TagTransformer<
  CalloutTag,
  GetCalloutTagDto,
  CalloutTagFilterName
> {
  protected model = CalloutTag;
  protected filters: Filters<CalloutTagFilterName> = calloutTagFilters;
  protected dtoType = GetCalloutTagDto;
  protected assignmentModel = CalloutResponseTag;
  protected entityIdField = "responseId";

  protected async transformQuery<T extends PaginatedQuery>(
    query: T,
    auth: AuthInfo
  ): Promise<T> {
    if (auth.roles.includes("admin")) {
      return query;
    }

    const reviewerRules = auth.contact
      ? await getReviewerRules(auth.contact, "calloutId")
      : [];

    if (reviewerRules.length === 0) {
      throw new UnauthorizedError();
    }

    return {
      ...query,
      rules: mergeRules([
        query.rules,
        {
          condition: "OR",
          rules: reviewerRules
        }
      ])
    };
  }
}

export const calloutTagTransformer = new CalloutTagTransformer();

class ContactTagTransformer extends TagTransformer<
  ContactTag,
  GetContactTagDto,
  ContactTagFilterName
> {
  protected model = ContactTag;
  protected filters: Filters<ContactTagFilterName> = contactTagFilters;
  protected dtoType = GetContactTagDto;
  protected assignmentModel = ContactTagAssignment;
  protected entityIdField = "contactId";

  protected allowedRoles: RoleType[] = ["admin"];
}

export const contactTagTransformer = new ContactTagTransformer();
