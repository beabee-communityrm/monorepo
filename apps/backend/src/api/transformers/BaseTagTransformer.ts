import type { RuleGroup, TagData } from '@beabee/beabee-common';
import { createQueryBuilder } from '@beabee/core/database';
import type {
  AuthInfo,
  FilterHandler,
  TagAssignment,
  TaggableEntity,
} from '@beabee/core/type';

import { plainToInstance } from 'class-transformer';
import { BadRequestError } from 'routing-controllers';

import { GetTagDto } from '#api/dto/TagDto';

import { BaseTransformer } from './BaseTransformer';

/**
 * Generic transformer for handling tag-related operations.
 * Provides functionality for converting tags and loading tag relationships.
 *
 * @template TModel - The tag model type extending TagData
 * @template TDto - The DTO type for tag responses, extending GetTagDto
 * @template TFilterName - The type for filter names
 */
abstract class BaseTagTransformer<
  TModel extends TagData,
  TDto extends GetTagDto,
  TFilterName extends string,
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
  convert(tag: TModel): TDto {
    return plainToInstance(this.dtoType, {
      id: tag.id,
      name: tag.name,
    });
  }

  /**
   * Loads tags for a collection of entities using their assignment model.
   * This method efficiently loads all tags for multiple entities in a single query.
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

    const entityTags = (await createQueryBuilder(this.assignmentModel, 'et')
      .where(`et.${this.entityIdField} IN (:...ids)`, { ids: entityIds })
      .innerJoinAndSelect('et.tag', 'tag')
      .orderBy('tag.name', 'ASC')
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
    tagUpdates: string[]
  ): Promise<void> {
    const addTags = tagUpdates
      .filter((tag) => tag.startsWith('+'))
      .flatMap((tag) =>
        entityIds.map((id) => ({
          [this.entityIdField]: id,
          tagId: tag.slice(1),
        }))
      );

    const removeTags = tagUpdates
      .filter((tag) => tag.startsWith('-'))
      .flatMap((tag) =>
        entityIds.map((id) => ({
          [this.entityIdField]: id,
          tagId: tag.slice(1),
        }))
      );

    if (addTags.length > 0) {
      await createQueryBuilder()
        .insert()
        .into(this.assignmentModel)
        .values(addTags as any) // TODO: fix properly
        .orIgnore()
        .execute();
    }
    if (removeTags.length > 0) {
      await createQueryBuilder()
        .delete()
        .from(this.assignmentModel)
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
    otherUpdates: Omit<T, 'tags'>;
  } {
    const { tags: tagUpdates, ...otherUpdates } = data;
    return { tagUpdates, otherUpdates };
  }

  /**
   * Deletes a tag and its assignments
   *
   * @param auth - The authentication info
   * @param rules - Rules to filter what to delete
   * @returns Whether or not any tags were deleted
   *
   * @example
   * await contactTagTransformer.delete(tagId, ContactTagAssignment);
   */
  async delete(auth: AuthInfo, rules: RuleGroup): Promise<boolean> {
    const { db } = await this.prepareQuery({ rules }, auth, 'delete');

    if (!db) {
      throw new BadRequestError('No rules provided');
    }

    // Delete any matching tag assignments first
    await createQueryBuilder()
      .delete()
      .from(this.assignmentModel)
      .where((qb) => {
        const subQb = createQueryBuilder()
          .subQuery()
          .select('item.id')
          .from(this.model, 'item')
          .where(db.where);

        qb.where('tagId IN ' + subQb.getQuery());
      })
      .setParameters(db.params)
      .execute();

    return await super.delete(auth, rules);
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
      .from(this.assignmentModel, 'ta');

    if (args.operator === 'contains' || args.operator === 'not_contains') {
      subQb.where(args.addParamSuffix('ta.tagId = :valueA'));
    }

    const inOp =
      args.operator === 'not_contains' || args.operator === 'is_empty'
        ? 'NOT IN'
        : 'IN';

    qb.where(`${args.fieldPrefix}id ${inOp} ${subQb.getQuery()}`);

    return args.operator === 'contains' || args.operator === 'not_contains'
      ? { valueA: args.value[0] }
      : {};
  };
}

export default BaseTagTransformer;
