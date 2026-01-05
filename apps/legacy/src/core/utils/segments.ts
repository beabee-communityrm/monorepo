import {
  Filters,
  calloutResponseFilters,
  contactCalloutFilters,
  contactFilters,
  flattenRules,
  getCalloutFilters,
  validateRuleGroup,
} from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { contactFilterHandlers } from '@beabee/core/filter-handlers';
import { Callout, Contact, Segment } from '@beabee/core/models';
import { prefixKeys } from '@beabee/core/utils/objects';
import { buildSelectQuery } from '@beabee/core/utils/rules';

import { isUUID } from 'class-validator';

/** @deprecated Only used in legacy codebase */
export async function getSegmentContacts(segment: Segment): Promise<Contact[]> {
  // This logic copied from BaseContactTransformer. As this method is deprecated
  // and should be removed soon, this duplication is acceptable for now.
  const calloutIds = flattenRules(segment.ruleGroup)
    .filter((r) => r.field.startsWith('callouts.'))
    .map((r) => {
      const [_, calloutId] = r.field.split('.', 2);
      return calloutId;
    })
    .filter((v, i, a) => a.indexOf(v) === i)
    .filter((id) => isUUID(id));

  const calloutFilters: Partial<Filters> = {};
  for (const calloutId of calloutIds) {
    const callout = await getRepository(Callout).findOneBy({ id: calloutId });
    if (callout) {
      Object.assign(
        calloutFilters,
        prefixKeys(`callouts.${calloutId}.`, contactCalloutFilters),
        prefixKeys(`callouts.${calloutId}.responses.`, {
          ...calloutResponseFilters,
          ...getCalloutFilters(callout.formSchema),
        })
      );
    }
  }

  const extendedFilters = { ...contactFilters, ...calloutFilters };

  const validatedRuleGroup = validateRuleGroup(
    extendedFilters,
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
