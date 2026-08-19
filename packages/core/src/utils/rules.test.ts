import {
  Filters,
  Rule,
  RuleGroup,
  calloutResponseFilters,
  contactCalloutFilters,
  contactFilters,
  validateRuleGroup,
} from '@beabee/beabee-common';

import { DataSource, EntitySchema } from 'typeorm';
import { beforeAll, describe, expect, test } from 'vitest';

import { dataSource } from '#database';
import { BadRequestError } from '#errors/BadRequestError';
import { contactFilterHandlers } from '#filter-handlers/index';
import { simpleFilterHandler } from '#filter-handlers/simple.filter-handlers';
import { Contact } from '#models/index';
import type { FilterHandler, FilterHandlers } from '#type/index';

import { prefixKeys } from './objects';
import { convertRulesToWhereClause, getFilterHandler } from './rules';

const testFilters: Filters = {
  name: { type: 'text' },
  firstName: { type: 'text' },
  description: { type: 'text', nullable: true },
  notes: { type: 'blob' },
  joined: { type: 'date' },
  amount: { type: 'number', nullable: true },
  active: { type: 'boolean', nullable: true },
  period: { type: 'enum', options: ['monthly', 'annually'] },
  tags: { type: 'array' },
  assignee: { type: 'contact', nullable: true },
  custom: { type: 'text' },
};

// A test entity matching testFilters so queries are converted to
// production-accurate SQL (identifier quoting, property to column mapping)
const TestItem = new EntitySchema({
  name: 'item',
  columns: {
    id: { type: String, primary: true },
    name: { type: String },
    firstName: { type: String },
    description: { type: String, nullable: true },
    notes: { type: String },
    joined: { type: Date },
    amount: { type: Number, nullable: true },
    active: { type: Boolean, nullable: true },
    period: { type: String },
    tags: { type: 'jsonb' },
    assignee: { type: String, nullable: true },
  },
});

const testDataSource = new DataSource({
  type: 'postgres',
  url: 'postgres://user:pass@localhost/test',
  entities: [TestItem],
});

// buildMetadatas is protected but, unlike initialize(), doesn't need a
// database connection
async function buildMetadatas(ds: DataSource): Promise<void> {
  await (ds as unknown as { buildMetadatas(): Promise<void> }).buildMetadatas();
}

beforeAll(async () => {
  // Entity metadata is needed to produce production-accurate SQL, and by the
  // contact filter handlers which build subqueries on the real entities
  await buildMetadatas(testDataSource);
  await buildMetadatas(dataSource);
});

/**
 * Validates the rule group, converts it to a where clause and applies it to a
 * query builder, without needing a database connection.
 */
function ruleToQuery(
  ruleGroup: RuleGroup,
  contact?: Contact,
  filterHandlers?: FilterHandlers<string>,
  filters: Filters = testFilters,
  // The regular search queries use "item", batchSelect uses "entity"
  alias = 'item'
): { where: string; params: Record<string, unknown> } {
  const [where, params] = convertRulesToWhereClause(
    validateRuleGroup(filters, ruleGroup),
    contact,
    filterHandlers,
    `${alias}.`
  );

  const query = testDataSource
    .createQueryBuilder()
    .select(`${alias}.id`)
    .from(TestItem, alias)
    .where(where, params)
    .getQuery();

  return { where: query.slice(query.indexOf(' WHERE ') + 7), params };
}

/** Shorthand for a rule group with a single rule */
function singleRule(
  field: string,
  operator: Rule['operator'],
  value: Rule['value'] = []
): RuleGroup {
  return {
    condition: 'AND',
    rules: [{ field, operator, value }],
  };
}

describe('operator SQL by filter type', () => {
  test('text: equal', () => {
    const { where, params } = ruleToQuery(singleRule('name', 'equal', ['foo']));
    expect(where).toBe('(TRUE AND ("item"."name" = :valueA_0))');
    expect(params).toEqual({ now: expect.any(Date), valueA_0: 'foo' });
  });

  test('text: camel case field names are quoted, preserving case', () => {
    expect(ruleToQuery(singleRule('firstName', 'equal', ['foo'])).where).toBe(
      '(TRUE AND ("item"."firstName" = :valueA_0))'
    );
  });

  test('text: begins_with and ends_with use ILIKE concatenation', () => {
    expect(ruleToQuery(singleRule('name', 'begins_with', ['fo'])).where).toBe(
      '(TRUE AND ("item"."name" ILIKE :valueA_0 || \'%\'))'
    );
    expect(ruleToQuery(singleRule('name', 'ends_with', ['oo'])).where).toBe(
      '(TRUE AND ("item"."name" ILIKE \'%\' || :valueA_0))'
    );
  });

  test('text: nullable fields are wrapped in COALESCE', () => {
    expect(
      ruleToQuery(singleRule('description', 'contains', ['foo'])).where
    ).toBe(
      "(TRUE AND (COALESCE(\"item\".\"description\", '') ILIKE '%' || :valueA_0 || '%'))"
    );
  });

  test('text: is_empty compares to empty string, not NULL', () => {
    expect(ruleToQuery(singleRule('name', 'is_empty')).where).toBe(
      '(TRUE AND ("item"."name" = \'\'))'
    );
    expect(ruleToQuery(singleRule('description', 'is_empty')).where).toBe(
      '(TRUE AND (COALESCE("item"."description", \'\') = \'\'))'
    );
  });

  test('blob: contains', () => {
    expect(ruleToQuery(singleRule('notes', 'contains', ['foo'])).where).toBe(
      '(TRUE AND ("item"."notes" ILIKE \'%\' || :valueA_0 || \'%\'))'
    );
  });

  test('number: between uses two parameters', () => {
    const { where, params } = ruleToQuery(
      singleRule('amount', 'between', [10, 20])
    );
    expect(where).toBe(
      '(TRUE AND ("item"."amount" BETWEEN :valueA_0 AND :valueB_0))'
    );
    expect(params).toEqual({
      now: expect.any(Date),
      valueA_0: 10,
      valueB_0: 20,
    });
  });

  test('number: is_empty on a nullable field compares to NULL', () => {
    expect(ruleToQuery(singleRule('amount', 'is_empty')).where).toBe(
      '(TRUE AND ("item"."amount" IS NULL))'
    );
  });

  test('date: absolute dates are truncated to day and converted to Date', () => {
    const { where, params } = ruleToQuery(
      singleRule('joined', 'greater', ['2022-12-01'])
    );
    expect(where).toBe(
      '(TRUE AND (DATE_TRUNC(\'day\', "item"."joined") > :valueA_0))'
    );
    expect(params.valueA_0).toEqual(new Date('2022-12-01T00:00:00'));
  });

  test('date: values with a time are truncated to their smallest unit', () => {
    const { where, params } = ruleToQuery(
      singleRule('joined', 'equal', ['2022-12-01T10:30'])
    );
    expect(where).toBe(
      '(TRUE AND (DATE_TRUNC(\'minute\', "item"."joined") = :valueA_0))'
    );
    expect(params.valueA_0).toEqual(new Date('2022-12-01T10:30:00'));
  });

  test('date: relative dates become Date parameters, truncated to at least day', () => {
    const { where, params } = ruleToQuery(
      singleRule('joined', 'less', ['$now(y:-1)'])
    );
    expect(where).toBe(
      '(TRUE AND (DATE_TRUNC(\'day\', "item"."joined") < :valueA_0))'
    );
    expect(params.valueA_0).toBeInstanceOf(Date);
  });

  test('boolean: equal', () => {
    const { where, params } = ruleToQuery(
      singleRule('active', 'equal', [true])
    );
    expect(where).toBe('(TRUE AND ("item"."active" = :valueA_0))');
    expect(params.valueA_0).toBe(true);
  });

  test('array: uses JSONB operators', () => {
    expect(ruleToQuery(singleRule('tags', 'contains', ['foo'])).where).toBe(
      '(TRUE AND ("item"."tags" ? :valueA_0))'
    );
    expect(ruleToQuery(singleRule('tags', 'is_empty')).where).toBe(
      '(TRUE AND ("item"."tags" ->> 0 IS NULL))'
    );
  });

  test('enum: equal', () => {
    expect(ruleToQuery(singleRule('period', 'equal', ['monthly'])).where).toBe(
      '(TRUE AND ("item"."period" = :valueA_0))'
    );
  });
});

describe('contact rules', () => {
  test('"me" is mapped to the contact id', () => {
    const contact = Object.assign(new Contact(), { id: 'contact-uuid-1' });
    const { where, params } = ruleToQuery(
      singleRule('assignee', 'equal', ['me']),
      contact
    );
    expect(where).toBe('(TRUE AND ("item"."assignee" = :valueA_0))');
    expect(params.valueA_0).toBe('contact-uuid-1');
  });

  test('other values are passed through unchanged', () => {
    const { params } = ruleToQuery(
      singleRule('assignee', 'equal', ['contact-uuid-2'])
    );
    expect(params.valueA_0).toBe('contact-uuid-2');
  });

  test('"me" without a contact throws BadRequestError', () => {
    expect(() => ruleToQuery(singleRule('assignee', 'equal', ['me']))).toThrow(
      BadRequestError
    );
  });
});

describe('rule groups', () => {
  test('AND groups seed with TRUE', () => {
    const { where } = ruleToQuery({
      condition: 'AND',
      rules: [
        { field: 'name', operator: 'equal', value: ['foo'] },
        { field: 'amount', operator: 'greater', value: [10] },
      ],
    });
    expect(where).toBe(
      '(TRUE AND ("item"."name" = :valueA_0) AND ("item"."amount" > :valueA_1))'
    );
  });

  test('OR groups seed with FALSE', () => {
    const { where } = ruleToQuery({
      condition: 'OR',
      rules: [
        { field: 'name', operator: 'equal', value: ['foo'] },
        { field: 'name', operator: 'equal', value: ['bar'] },
      ],
    });
    expect(where).toBe(
      '(FALSE OR ("item"."name" = :valueA_0) OR ("item"."name" = :valueA_1))'
    );
  });

  test('nested groups are bracketed and share the parameter counter', () => {
    const { where, params } = ruleToQuery({
      condition: 'AND',
      rules: [
        { field: 'name', operator: 'equal', value: ['foo'] },
        {
          condition: 'OR',
          rules: [
            { field: 'amount', operator: 'less', value: [10] },
            { field: 'amount', operator: 'greater', value: [20] },
          ],
        },
      ],
    });
    expect(where).toBe(
      '(TRUE AND ("item"."name" = :valueA_0) AND ' +
        '(FALSE OR ("item"."amount" < :valueA_1) OR ("item"."amount" > :valueA_2)))'
    );
    expect(params).toEqual({
      now: expect.any(Date),
      valueA_0: 'foo',
      valueA_1: 10,
      valueA_2: 20,
    });
  });

  test('params always include the current date as :now', () => {
    const { params } = ruleToQuery({ condition: 'AND', rules: [] });
    expect(params.now).toBeInstanceOf(Date);
  });
});

describe('custom filter handlers', () => {
  test('extra params returned by a handler get the rule suffix', () => {
    const handlers: FilterHandlers<string> = {
      custom: (qb, args) => {
        qb.where(args.addParamSuffix('item.name = :other'));
        return { other: args.value[0] };
      },
    };
    const { where, params } = ruleToQuery(
      singleRule('custom', 'equal', ['foo']),
      undefined,
      handlers
    );
    expect(where).toBe('(TRUE AND ("item"."name" = :other_0))');
    expect(params.other_0).toBe('foo');
  });

  test('addParamSuffix leaves casts like ::text alone', () => {
    const handlers: FilterHandlers<string> = {
      custom: (qb, args) => {
        qb.where(args.addParamSuffix('item.name::text = :valueA'));
        return { valueA: args.value[0] };
      },
    };
    const { where } = ruleToQuery(
      singleRule('custom', 'equal', ['foo']),
      undefined,
      handlers
    );
    // Note TypeORM doesn't map property paths that are followed by a cast
    expect(where).toBe('(TRUE AND (item.name::text = :valueA_0))');
  });

  test('convertToWhereClause applies operator, field transform and suffix', () => {
    const handlers: FilterHandlers<string> = {
      custom: (qb, args) => {
        // Map the "custom" filter to the name column
        qb.where(args.convertToWhereClause(`${args.fieldPrefix}name`));
      },
    };
    const { where } = ruleToQuery(
      singleRule('custom', 'equal', ['foo']),
      undefined,
      handlers
    );
    expect(where).toBe('(TRUE AND ("item"."name" = :valueA_0))');
  });
});

describe('contact callout filters', () => {
  // Replays the rules from a real contact search request. The filters are
  // built the same way as BaseContactTransformer.transformFilters and the
  // real contact filter handlers are used.
  const CALLOUT_1 = '19aaf2fe-6d08-479b-938f-4f8b26f6b443';
  const CALLOUT_2 = '322608d0-ed3f-49b7-a523-921e4da42c68';

  // Cast needed as prefixKeys isn't generic and loses the filter types
  const calloutFilters = {
    ...prefixKeys(`callouts.${CALLOUT_1}.`, contactCalloutFilters),
    ...prefixKeys(`callouts.${CALLOUT_2}.responses.`, calloutResponseFilters),
  } as Filters;

  test('hasAnswered and responses rules become subqueries on callout_response', () => {
    const { where, params } = ruleToQuery(
      {
        condition: 'OR',
        rules: [
          {
            field: `callouts.${CALLOUT_1}.hasAnswered`,
            operator: 'equal',
            value: [true],
          },
          {
            field: `callouts.${CALLOUT_2}.responses.createdAt`,
            operator: 'greater',
            value: ['2025-10-09'],
          },
        ],
      },
      undefined,
      contactFilterHandlers,
      calloutFilters
    );

    expect(where).toBe(
      '(FALSE OR ("item"."id" IN ' +
        '(SELECT "response"."contactId" AS "response_contactId" FROM "callout_response" "response" ' +
        'WHERE "response"."calloutId" = :calloutId_0 AND "response"."contactId" IS NOT NULL)' +
        ') OR ("item"."id" IN ' +
        '(SELECT "response"."contactId" AS "response_contactId" FROM "callout_response" "response" ' +
        'WHERE DATE_TRUNC(\'day\', "response"."createdAt") > :valueA_1 ' +
        'AND "response"."calloutId" = :calloutId_1 AND "response"."contactId" IS NOT NULL)' +
        '))'
    );
    expect(params).toEqual({
      now: expect.any(Date),
      calloutId_0: CALLOUT_1,
      valueA_0: true,
      calloutId_1: CALLOUT_2,
      valueA_1: new Date('2025-10-09T00:00:00'),
    });
  });

  test('responses rules work with a differently aliased outer query (batchSelect)', () => {
    const { where } = ruleToQuery(
      singleRule(`callouts.${CALLOUT_2}.responses.createdAt`, 'greater', [
        '2025-10-09',
      ]),
      undefined,
      contactFilterHandlers,
      calloutFilters,
      'entity'
    );

    expect(where).toBe(
      '(TRUE AND ("entity"."id" IN ' +
        '(SELECT "response"."contactId" AS "response_contactId" FROM "callout_response" "response" ' +
        'WHERE DATE_TRUNC(\'day\', "response"."createdAt") > :valueA_0 ' +
        'AND "response"."calloutId" = :calloutId_0 AND "response"."contactId" IS NOT NULL)' +
        '))'
    );
  });
});

describe('rule values never reach the SQL as text', () => {
  test('hostile values are bound as parameters', () => {
    const { where, params } = ruleToQuery(
      singleRule('name', 'equal', ["'; DROP TABLE contact;--"])
    );
    expect(where).toBe('(TRUE AND ("item"."name" = :valueA_0))');
    expect(params.valueA_0).toBe("'; DROP TABLE contact;--");
  });

  test('activePermission binds the role type as a parameter', () => {
    const { where, params } = ruleToQuery(
      singleRule('activePermission', 'equal', ['admin']),
      undefined,
      contactFilterHandlers,
      contactFilters
    );
    expect(where).toBe(
      '(TRUE AND ("item"."id" IN ' +
        '(SELECT "cr"."contactId" AS "cr_contactId" FROM "contact_role" "cr" ' +
        'WHERE "cr"."type" = :roleType_0 AND "cr"."dateAdded" <= :now ' +
        'AND ("cr"."dateExpires" IS NULL OR "cr"."dateExpires" > :now))))'
    );
    expect(params.roleType_0).toBe('admin');
  });
});

describe('getFilterHandler', () => {
  const exactHandler: FilterHandler = () => {};
  const catchallHandler: FilterHandler = () => {};
  const handlers: FilterHandlers<string> = {
    'callouts.id': exactHandler,
    'callouts.': catchallHandler,
  };

  test('returns the exact handler if there is one', () => {
    expect(getFilterHandler(handlers, 'callouts.id')).toBe(exactHandler);
  });

  test('falls back to the catch-all handler for subfields', () => {
    expect(getFilterHandler(handlers, 'callouts.foo')).toBe(catchallHandler);
  });

  test('falls back to simpleFilterHandler otherwise', () => {
    expect(getFilterHandler(handlers, 'other')).toBe(simpleFilterHandler);
    expect(getFilterHandler(undefined, 'callouts.foo')).toBe(
      simpleFilterHandler
    );
  });
});
