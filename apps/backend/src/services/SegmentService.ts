import { contactFilters, validateRuleGroup } from "@beabee/beabee-common";
import { SegmentService as CoreSegmentService, getRepository } from "@beabee/core";

import ContactTransformer from "@api/transformers/ContactTransformer";
import { buildSelectQuery } from "@api/utils/rules";

import { Contact, Segment, SegmentContact } from "@beabee/models";

import { AuthInfo } from "#types/auth-info";

class SegmentService extends CoreSegmentService {
  /** @deprecated */
  async getSegmentsWithCount(auth: AuthInfo | undefined): Promise<Segment[]> {
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
  async getSegmentContacts(segment: Segment): Promise<Contact[]> {
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
}

export default new SegmentService();
