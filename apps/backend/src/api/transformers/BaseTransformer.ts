import {
  Filters,
  InvalidRule,
  PaginatedQuery,
  RoleType,
  RuleGroup,
  validateRuleGroup
} from "@beabee/beabee-common";
import { plainToInstance } from "class-transformer";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

import { createQueryBuilder } from "@beabee/core/database";

import { PaginatedDto } from "@api/dto/PaginatedDto";
import {
  NotFoundError,
  InvalidRuleError,
  UnauthorizedError
} from "@beabee/core/errors";
import { batchUpdate, convertRulesToWhereClause } from "@api/utils/rules";

import { AuthInfo, FetchRawResult, FilterHandlers } from "@type/index";
import { BadRequestError } from "routing-controllers";

/**
 * Base transformer for querying and converting models to DTOs
 */
export abstract class BaseTransformer<
  Model extends ObjectLiteral,
  GetDto,
  FilterName extends string = never,
  GetDtoOpts = unknown,
  Query extends GetDtoOpts & PaginatedQuery = GetDtoOpts & PaginatedQuery
> {
  protected abstract model: { new (): Model };
  protected modelIdField = "id";

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

  protected allowedRoles: RoleType[] | undefined;

  abstract convert(model: Model, auth: AuthInfo, opts?: GetDtoOpts): GetDto;

  /**
   * Transform the query before the results are fetched.
   *
   * This is typically used to add extra rules that limit the results returned
   * based on the query or auth.
   *
   * @param query The query
   * @param auth The authentication info
   * @returns A new query
   */
  protected transformQuery<T extends Query>(
    query: T,
    auth: AuthInfo
  ): T | Promise<T> {
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
    auth: AuthInfo
  ): void {}

  /**
   * Modify the items after they are fetched.
   *
   * Use this method to add extra data to the items. Typically used to add
   * related entities to the items, or load additional data or relations which
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
  protected async preFetch<T extends Query>(
    query: T,
    auth: AuthInfo
  ): Promise<{
    query: T;
    filters: Filters<FilterName>;
    filterHandlers: FilterHandlers<FilterName>;
  }> {
    if (
      this.allowedRoles &&
      !this.allowedRoles.some((r) => auth.roles.includes(r))
    ) {
      throw new UnauthorizedError();
    }

    const [filters, filterHandlers] = await this.transformFilters(query, auth);

    return {
      query: await this.transformQuery(query, auth),
      filters: { ...this.filters, ...filters },
      filterHandlers: { ...this.filterHandlers, ...filterHandlers }
    };
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
    const { query, filters, filterHandlers } = await this.preFetch(
      query_,
      auth
    );

    const limit = query.limit || 50;
    const offset = query.offset || 0;

    let ruleGroup;
    try {
      ruleGroup = query.rules && validateRuleGroup(filters, query.rules);
    } catch (err) {
      throw err instanceof InvalidRule
        ? new InvalidRuleError(err.rule, err.message)
        : err;
    }

    const qb = createQueryBuilder(this.model, "item").offset(offset);

    if (limit !== -1) {
      qb.limit(limit);
    }

    if (ruleGroup) {
      qb.where(
        ...convertRulesToWhereClause(
          ruleGroup,
          auth.contact,
          filterHandlers,
          "item."
        )
      );
    }

    if (query.sort) {
      qb.orderBy(`item."${query.sort}"`, query.order || "ASC", "NULLS LAST");
    }

    this.modifyQueryBuilder(qb, "item.", query, auth);

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
      items: items.map((item) => this.convert(item, auth, query))
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
        condition: "AND",
        rules: [{ field: this.modelIdField, operator: "equal", value: [id] }]
      }
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
   * @param auth The contact who is requesting the results
   * @param rules The rules to match the items to delete
   * @returns Whether any items were deleted or not
   */
  async delete(auth: AuthInfo, rules: RuleGroup): Promise<boolean> {
    const { query, filters, filterHandlers } = await this.preFetch(
      { rules } as Query, // TODO: why casting?
      auth
    );

    if (!query.rules) {
      throw new BadRequestError(
        "No rules provided to delete, this would delete all items"
      );
    }

    const result = await createQueryBuilder()
      .delete()
      .from(this.model)
      .where(
        ...convertRulesToWhereClause(
          validateRuleGroup(filters, query.rules),
          auth.contact,
          filterHandlers,
          ""
        )
      )
      .execute();

    return result.affected == null || result.affected > 0;
  }

  async deleteById(auth: AuthInfo, id: string): Promise<boolean> {
    return await this.delete(auth, {
      condition: "AND",
      rules: [{ field: this.modelIdField, operator: "equal", value: [id] }]
    });
  }

  async update(
    auth: AuthInfo,
    opts: { rules: RuleGroup; updates: Partial<Model> }
  ): Promise<number> {
    const { query, filters, filterHandlers } = await this.preFetch(
      { rules: opts.rules } as Query, // TODO: why casting?
      auth
    );

    if (!query.rules) {
      throw new BadRequestError(
        "No rules provided to update, this would update all items"
      );
    }

    const res = await batchUpdate(
      this.model,
      filters,
      query.rules,
      opts.updates,
      auth.contact,
      filterHandlers
    );

    return res.affected || -1;
  }

  async updateById(
    auth: AuthInfo,
    id: string,
    updates: Partial<Model>
  ): Promise<boolean> {
    const updated = await this.update(auth, {
      rules: {
        condition: "AND",
        rules: [{ field: this.modelIdField, operator: "equal", value: [id] }]
      },
      updates
    });
    return updated > 0;
  }
}
