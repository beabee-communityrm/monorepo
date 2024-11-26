import { createQueryBuilder } from "@beabee/core/database";
import { FilterHandler } from "@beabee/core/type";

const createTagFilterHandler = (entityIdField: string, tableName: string) => {
  /**
   * Creates a filter handler for tag-based filtering
   */
  const tagFilterHandler: FilterHandler = (qb, args) => {
    const subQb = createQueryBuilder()
      .subQuery()
      .select(`ta.${entityIdField}`)
      .from(tableName, "ta");

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

  return tagFilterHandler;
};

export const contactTagFilterHandler = createTagFilterHandler(
  "contactId",
  "contact_tag_assignments"
);

export const calloutTagFilterHandler = createTagFilterHandler(
  "responseId",
  "callout_response_tag"
);
