import type { Rule } from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { BadRequestError } from '@beabee/core/errors';
import type { Contact } from '@beabee/core/models';
import { CalloutReviewer } from '@beabee/core/models';
import type { AuthInfo } from '@beabee/core/type';

import { In } from 'typeorm';

export async function getReviewerRules(
  contact: Contact | undefined,
  field: 'id' | 'calloutId',
  onlyCanEdit: boolean
): Promise<Rule[]> {
  if (!contact) {
    return [];
  }

  const reviewer = await getRepository(CalloutReviewer).findBy({
    contactId: contact.id,
    ...(onlyCanEdit && { canEdit: true }),
  });

  return reviewer.map((r) => ({
    field,
    operator: 'equal',
    value: [r.calloutId],
  }));
}

export async function canCreateForCallout(
  auth: AuthInfo,
  data: { calloutId?: string }[]
): Promise<boolean> {
  if (auth.roles.includes('admin')) {
    return true;
  } else if (!auth.contact) {
    return false;
  }

  const calloutIds = data
    .map((t) => t.calloutId)
    .filter((s): s is string => !!s)
    .filter((id, index, self) => self.indexOf(id) === index);

  if (!calloutIds.length) {
    throw new BadRequestError('Callout IDs required');
  }

  const reviewers = await getRepository(CalloutReviewer).findBy({
    contactId: auth.contact.id,
    calloutId: In(calloutIds),
  });

  return calloutIds.every((id) => reviewers.some((r) => r.calloutId === id));
}
