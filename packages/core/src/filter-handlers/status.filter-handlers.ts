import { ItemStatus } from "@beabee/beabee-common";
import { BadRequestError } from "routing-controllers";
import { Brackets } from "typeorm";

import type { FilterHandler } from "#type";

/**
 * Status is a virtual field that maps to starts and expires, this function
 * applies the correct filter for the status field value
 *
 * @param qb The query builder
 * @param args The rule arguments
 */
export const statusFilterHandler: FilterHandler = (qb, args) => {
  // TODO: handle other operators
  if (args.operator !== "equal") {
    throw new BadRequestError("Status field only supports equal operator");
  }

  switch (args.value[0]) {
    case ItemStatus.Draft:
      qb.where(`${args.fieldPrefix}starts IS NULL`);
      break;
    case ItemStatus.Scheduled:
      qb.where(`${args.fieldPrefix}starts > :now`);
      break;
    case ItemStatus.Open:
      qb.where(`${args.fieldPrefix}starts < :now`).andWhere(
        new Brackets((qb) => {
          qb.where(`${args.fieldPrefix}expires IS NULL`).orWhere(
            `${args.fieldPrefix}expires > :now`
          );
        })
      );
      break;
    case ItemStatus.Ended:
      qb.where(`${args.fieldPrefix}starts < :now`).andWhere(
        `${args.fieldPrefix}expires < :now`
      );
      break;
  }
};
