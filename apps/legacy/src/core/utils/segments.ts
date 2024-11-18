import { validateRuleGroup, contactFilters } from "@beabee/beabee-common";
import { Contact, Segment } from "@beabee/core/models";

import { buildSelectQuery } from "@api/utils";

/** @deprecated */
export async function getSegmentContacts(segment: Segment): Promise<Contact[]> {
  const validatedRuleGroup = validateRuleGroup(
    contactFilters,
    segment.ruleGroup
  );
  const qb = buildSelectQuery(
    Contact,
    validatedRuleGroup,
    undefined,
    ContactTransformer.filterHandlers
  );

  qb.leftJoinAndSelect("item.profile", "profile").leftJoinAndSelect(
    "item.roles",
    "mp"
  );

  return await qb.getMany();
}
