import { validateRuleGroup, contactFilters } from "@beabee/beabee-common";
import { getRepository } from "@beabee/core/database";
import { Contact, Segment } from "@beabee/core/models";

import ContactTransformer from "@api/transformers/ContactTransformer";
import { buildSelectQuery } from "@api/utils";

import { AuthInfo } from "@type/auth-info";

/** @deprecated */
export async function getSegmentsWithCount(auth: AuthInfo): Promise<Segment[]> {
  const segments = await getRepository(Segment).find({
    order: { order: "ASC" }
  });
  for (const segment of segments) {
    const result = await ContactTransformer.fetch(auth, {
      limit: 0,
      rules: segment.ruleGroup
    });
    segment.contactCount = result.total;
  }
  return segments;
}

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
