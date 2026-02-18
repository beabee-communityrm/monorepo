import {
  Filters,
  InvalidRule,
  PaginatedQuery,
  Rule,
  RuleGroup,
  validateRuleGroup,
} from '@beabee/beabee-common';
import { createQueryBuilder, getRepository } from '@beabee/core/database';
import {
  InvalidRuleError,
  NotFoundError,
  UnauthorizedError,
} from '@beabee/core/errors';
import { AuthInfo, FilterHandlers } from '@beabee/core/type';
import { convertRulesToWhereClause } from '@beabee/core/utils/rules';

import { plainToInstance } from 'class-transformer';
import { BadRequestError } from 'routing-controllers';
import { Brackets, ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { PaginatedDto } from '#api/dto/PaginatedDto';
import { TransformerOperation } from '#type/index';
import { FetchRawResult } from '#type/index';

/**
 * Base transformer for querying and converting models to DTOs
 */
export abstract class BaseTransformer<
  Model extends ObjectLiteral,
  GetDto,
  FilterName extends string = never,
  GetDtoOpts = unknown,
  Query extends GetDtoOpts & PaginatedQuery = GetDtoOpts & PaginatedQuery,
> {
  protected abstract model: { new (): Model };
  protected modelIdField = 'id';

  protected abstract filters: Filters<FilterName>;
  /**
   * A collection of filter handlers that process query filters for specific fields.
   *
   * Each handler is a function that modifies the query builder based on filter conditions.
   * Handlers can be used to:
   * - Add WHERE clauses
   * - Join related tables
   * - Add complex filtering logic
   *
   * @example
   * ```typescript
   * filterHandlers = {
   *   // Simple field filter
   *   email: (qb, args) => {
   *     qb.where(`email = :value`, { value: args.value[0] });
   *   },
   *
   *   // Complex relation filter
   *   tags: (qb, args) => {
   *     const subQb = createQueryBuilder()
   *       .subQuery()
   *       .select("tag_assignment.contactId")
   *       .from("contact_tag_assignments", "tag_assignment");
   *
   *     if (args.operator === "contains") {
   *       subQb.where("tag_assignment.tagId = :tagId");
   *       qb.where(`id IN ${subQb.getQuery()}`, { tagId: args.value[0] });
   *     }
   *   }
   * }
   * ```
   *
   * @see FilterHandler Type definition for filter handler functions
   * @see FilterHandlers Interface for the complete handlers collection
   */
  protected filterHandlers: FilterHandlers<FilterName> = {};

  abstract convert(model: Model, auth: AuthInfo, opts?: GetDtoOpts): GetDto;

  /**
   * Get the authentication rules for the given operation. By default non-admins
   * are denied all operations.
   *
   * @param auth The authentication info
   * @param operation The operation being performed
   * @returns The authentication rules, or false to deny all
   */
  protected async getNonAdminAuthRules(
    auth: AuthInfo,
    query: Query,
    operation: TransformerOperation
  ): Promise<(Rule | RuleGroup)[]> {
    return [];
  }

  /**
   * Temporary method to check the authentication before creating
   * TODO: this method should use the same query building logic as the fetch,
   * update and delete methods. This is possible!
   * https://brunoscheufler.com/blog/2020-02-08-conditional-inserts-in-postgres
   *
   * @param auth
   * @param data
   * @returns Whether the item can be created or not
   */
  protected async canCreate(
    auth: AuthInfo,
    data: Partial<Model>[]
  ): Promise<boolean> {
    // Default to only admins for now as creating doesn't yet implement the
    // query building logic
    return auth.roles.includes('admin');
  }

  /**
   * Transform the query before the results are fetched. This is typically used
   * to add extra rules that limit the results returned
   *
   * @param query The query
   * @param auth The authentication info
   * @returns A new query
   */
  protected transformQuery<T extends Query>(query: T): T {
    return query;
  }

  /**
   * Transform the filters before the results are fetched.
   *
   * This can be used to add extra filters and handlers depending on the query
   *
   * @param query The query
   * @param auth The authentication info
   * @returns New filters and filter handlers
   */
  protected async transformFilters(
    query: Query,
    auth: AuthInfo
  ): Promise<[Partial<Filters<FilterName>>, FilterHandlers<FilterName>]> {
    return [{}, {}];
  }

  /**
   * Modify the query builder before the results are fetched.
   *
   * Use this method to add extra joins, where clauses, etc. to the query builder
   * which load any additional data needed for the results. Typically used to
   * add joins to related entities.
   *
   * @param qb The query builder
   * @param fieldPrefix The prefix to use for fields
   * @param query The query
   * @param auth The authentication info
   */
  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<Model>,
    fieldPrefix: string,
    query: Query,
    auth: AuthInfo,
    operation: TransformerOperation
  ): void {}

  /**
   * Modify the items after they are fetched.
   *
   * Use this method to add extra data to the items. Typically used to add
   * related entities to the items, or load additional data or relations which
   * are not loaded by the initial query
   *
   * @param items The list of items
   * @param query The query
   * @param auth The authentication info
   */
  protected async modifyItems(
    items: Model[],
    query: Query,
    auth: AuthInfo
  ): Promise<void> {}

  /**
   * Check for sufficient authentication and prepare the query,
   * filters and filter handlers.
   *
   * @param query The query
   * @param auth The contact who is requesting the results
   */
  protected async prepareQuery<T extends Query>(
    query: T,
    auth: AuthInfo,
    operation: TransformerOperation
  ): Promise<{
    query: T;
    filters: Filters<FilterName>;
    filterHandlers: FilterHandlers<FilterName>;
    db: { where: Brackets; params: Record<string, unknown> } | undefined;
  }> {
    // Apply any transformations to the query
    const finalQuery = this.transformQuery(query);

    // Apply the authentication rules if not an admin
    if (!auth.roles.includes('admin')) {
      const authRules = await this.getNonAdminAuthRules(
        auth,
        finalQuery,
        operation
      );
      if (!authRules.length) {
        throw new UnauthorizedError();
      }

      // Merge the authentication rules with any existing rules
      finalQuery.rules = {
        condition: 'AND',
        rules: [
          ...(finalQuery.rules ? [finalQuery.rules] : []),
          { condition: 'OR', rules: authRules },
        ],
      };
    }

    // Convert the query filters to a WHERE clause
    const [filters, filterHandlers] = await this.transformFilters(
      finalQuery,
      auth
    );
    const finalFilters = { ...this.filters, ...filters };
    const finalFilterHandlers = { ...this.filterHandlers, ...filterHandlers };

    try {
      let db;
      if (finalQuery.rules) {
        const validatedRules = validateRuleGroup(
          finalFilters,
          finalQuery.rules
        );

        const [where, params] = convertRulesToWhereClause(
          validatedRules,
          auth.contact,
          finalFilterHandlers,
          'item.'
        );

        db = { where, params };
      }

      return {
        query: finalQuery,
        db,
        // TODO: Remove once contact and callout response transformers have been updated
        filters: finalFilters,
        filterHandlers: finalFilterHandlers,
      };
    } catch (err) {
      throw err instanceof InvalidRule
        ? new InvalidRuleError(err.rule, err.message)
        : err;
    }
  }

  /**
   * Fetch a list of items without converting them to DTOs
   *
   * @param auth The contact who is requesting the results
   * @param query
   * @returns A list of items that match the query
   */
  async fetchRaw(
    auth: AuthInfo,
    query_: Query
  ): Promise<FetchRawResult<Model, Query>> {
    const { query, db } = await this.prepareQuery(query_, auth, 'read');

    const limit = query.limit || 50;
    const offset = query.offset || 0;

    const qb = createQueryBuilder(this.model, 'item').offset(offset);

    if (limit !== -1) {
      qb.limit(limit);
    }

    if (db) {
      qb.where(db.where, db.params);
    }

    if (query.sort) {
      qb.orderBy(`item."${query.sort}"`, query.order || 'ASC', 'NULLS LAST');
    }

    this.modifyQueryBuilder(qb, 'item.', query, auth, 'read');

    const [items, total] = await qb.getManyAndCount();

    await this.modifyItems(items, query, auth);

    return { items, total, offset, query };
  }

  /**
   * Fetch a list of items
   *
   * @param auth The contact who is requesting the results
   * @param query_ The query
   * @returns A list of items that match the query
   */
  async fetch(auth: AuthInfo, query_: Query): Promise<PaginatedDto<GetDto>> {
    const { items, total, query, offset } = await this.fetchRaw(auth, query_);

    return plainToInstance(PaginatedDto<GetDto>, {
      total,
      offset,
      count: items.length,
      items: items.map((item) => this.convert(item, auth, query)),
    });
  }

  /**
   *  Fetch a single item
   *
   * @param auth The contact who is requesting the results
   * @param query The query
   * @returns A single item or undefined if not found
   */
  async fetchOne(auth: AuthInfo, query: Query): Promise<GetDto | undefined> {
    const result = await this.fetch(auth, { ...query, limit: 1 });
    return result.items[0];
  }

  /**
   * Fetch a single item or throw an error if not found
   * @param auth The authorisation info
   * @param query The query
   * @returns A single item
   */
  async fetchOneOrFail(auth: AuthInfo, query: Query): Promise<GetDto> {
    const result = await this.fetchOne(auth, query);
    if (!result) {
      throw new NotFoundError();
    }
    return result;
  }

  /**
   * Fetch a single item by it's primary key
   *
   * @param auth The authentication info
   * @param id The primary key of the item
   * @param opts Additional options to pass to the query
   * @returns A single item or undefined if not found
   */
  async fetchOneById(
    auth: AuthInfo,
    id: string,
    opts?: GetDtoOpts
  ): Promise<GetDto | undefined> {
    const query = {
      ...opts,
      rules: {
        condition: 'AND',
        rules: [{ field: this.modelIdField, operator: 'equal', value: [id] }],
      },
    } as Query;

    return await this.fetchOne(auth, query);
  }

  /**
   * Fetch a single item by it's primary key or throw an error if not found
   *
   * @param auth  The contact who is requesting the results
   * @param id  The primary key of the item
   * @param opts Additional options to pass to the query
   * @returns A single item
   */
  async fetchOneByIdOrFail(
    auth: AuthInfo,
    id: string,
    opts?: GetDtoOpts
  ): Promise<GetDto> {
    const result = await this.fetchOneById(auth, id, opts);
    if (!result) {
      throw new NotFoundError();
    }
    return result;
  }

  /**
   * Fetch the number of items that match the query
   *
   * @param auth The contact who is requesting the results
   * @param query The query
   * @returns The number of items that match the query
   */
  async count(auth: AuthInfo, query: Query): Promise<number> {
    return (await this.fetch(auth, { ...query, limit: 0 })).total;
  }

  /**
   * Delete the items that match the query
   *
   * @param auth The contact who is requesting the results
   * @param rules The rules to match the items to delete
   * @returns Whether any items were deleted or not
   */
  async delete(auth: AuthInfo, rules: RuleGroup): Promise<boolean> {
    const { query, db } = await this.prepareQuery(
      { rules } as Query, // TODO: why casting?
      auth,
      'delete'
    );

    if (!db) {
      throw new BadRequestError(
        'No rules provided to delete, this would delete all items'
      );
    }

    const result = await createQueryBuilder()
      .delete()
      .from(this.model)
      .where((qb) => {
        const subQb = createQueryBuilder()
          .subQuery()
          .select('item.' + this.modelIdField)
          .from(this.model, 'item')
          .where(db.where);

        this.modifyQueryBuilder(subQb, 'item.', query, auth, 'delete');

        // Override select to only select the primary key
        subQb.select('item.' + this.modelIdField);

        qb.where(this.modelIdField + ' IN ' + subQb.getQuery());
      })
      .setParameters(db.params)
      .execute();

    return result.affected == null || result.affected > 0;
  }

  /**
   * Delete an item by it's primary key

   * @param auth The authentication info
   * @param id The primary key of the item
   * @returns Whether the item was deleted or not
   */
  async deleteById(auth: AuthInfo, id: string): Promise<boolean> {
    return await this.delete(auth, {
      condition: 'AND',
      rules: [{ field: this.modelIdField, operator: 'equal', value: [id] }],
    });
  }

  /**
   * Update items that match the given query
   *
   * @param auth The authentication info
   * @param opts
   * @returns How many items were updated
   */
  async update(
    auth: AuthInfo,
    rules: RuleGroup,
    updates: Partial<Model>
  ): Promise<number> {
    const { query, db } = await this.prepareQuery(
      { rules } as Query, // TODO: why casting?
      auth,
      'update'
    );

    if (!db) {
      throw new BadRequestError(
        'No rules provided to update, this would update all items'
      );
    }

    const res = await createQueryBuilder()
      .update(this.model)
      .set(updates)
      .where((qb) => {
        const subQb = createQueryBuilder()
          .subQuery()
          .from(this.model, 'item')
          .where(db.where);

        this.modifyQueryBuilder(subQb, 'item.', query, auth, 'update');

        // Override select to only select the primary key
        subQb.select('item.' + this.modelIdField);

        qb.where(this.modelIdField + ' IN ' + subQb.getQuery());
      })
      .setParameters(db.params)
      .execute();

    return res.affected || -1;
  }

  /**
   * Update an item by it's primary key
   *
   * @param auth The authentication info
   * @param id The primary key of the item
   * @param updates The updates to apply
   * @returns Whether the item was updated or not
   */
  async updateById(
    auth: AuthInfo,
    id: string,
    updates: Partial<Model>
  ): Promise<boolean> {
    const updated = await this.update(
      auth,
      {
        condition: 'AND',
        rules: [{ field: this.modelIdField, operator: 'equal', value: [id] }],
      },
      updates
    );
    return updated > 0;
  }

  /**
   * Create new items
   *
   * @param auth The authentication info
   * @param data The data to create the items with
   * @returns The IDs of the created items
   */
  async create(auth: AuthInfo, data: Partial<Model>[]): Promise<string[]> {
    if (!(await this.canCreate(auth, data))) {
      throw new UnauthorizedError();
    }

    const items = await getRepository(this.model).save(data as Model[]);
    return items.map((item) => item[this.modelIdField]);
  }

  /**
   * Create a new item
   *
   * @param auth The authentication info
   * @param data The data to create the item with
   * @returns The created item
   */
  async createOne(auth: AuthInfo, data: Partial<Model>): Promise<GetDto> {
    const [newId] = await this.create(auth, [data]);
    return this.fetchOneByIdOrFail(auth, newId);
  }
}
