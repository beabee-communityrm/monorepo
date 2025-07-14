import { Rule } from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { CalloutReviewer, Contact } from '@beabee/core/models';

export async function getReviewerRules(
  contact: Contact | undefined,
  field: 'id' | 'calloutId',
  onlyCanEdit: boolean
): Promise<Rule[]> {
  // Reviewers can never create or delete (for now)
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
