import { contactFilters, validateRuleGroup } from '@beabee/beabee-common';
import { contactFilterHandlers } from '@beabee/core/filter-handlers';
import { Contact, Segment } from '@beabee/core/models';
import { buildSelectQuery } from '@beabee/core/utils/rules';

/** @deprecated Only used in legacy codebase */
export async function getSegmentContacts(segment: Segment): Promise<Contact[]> {
  const validatedRuleGroup = validateRuleGroup(
    contactFilters,
    segment.ruleGroup
  );
  const qb = buildSelectQuery(
    Contact,
    validatedRuleGroup,
    undefined,
    contactFilterHandlers
  );

  qb.leftJoinAndSelect('item.profile', 'profile').leftJoinAndSelect(
    'item.roles',
    'mp'
  );

  return await qb.getMany();
}
