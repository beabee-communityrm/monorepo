import { Rule } from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { Contact, CalloutReviewer } from '@beabee/core/models';

export async function getReviewerRules(
  contact: Contact | undefined,
  field: 'id' | 'calloutId'
): Promise<Rule[]> {
  if (!contact) {
    return [];
  }

  const reviewer = await getRepository(CalloutReviewer).findBy({
    contactId: contact.id,
  });

  return reviewer.map((r) => ({
    field,
    operator: 'equal',
    value: [r.calloutId],
  }));
}
