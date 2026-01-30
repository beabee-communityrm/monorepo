import { getRepository } from '@beabee/core/database';
import { Contact, Segment } from '@beabee/core/models';
import EmailService from '@beabee/core/services/EmailService';
import { AuthInfo } from '@beabee/core/type';

import ContactTransformer from '@api/transformers/ContactTransformer';
import { NotFoundError } from 'routing-controllers';

const PAGE_SIZE = 100;

/**
 * Sends a one-off email to all contacts in a segment (chunked).
 * Uses the same segment rule group as getSegmentContacts for consistency.
 */
export async function sendEmailToSegment(
  auth: AuthInfo,
  segmentId: string,
  subject: string,
  body: string
): Promise<void> {
  const segment = await getRepository(Segment).findOneBy({ id: segmentId });
  if (!segment) throw new NotFoundError();

  let offset = 0;
  while (true) {
    const { items } = await ContactTransformer.fetchRawForSegment(
      auth,
      segment.ruleGroup,
      { limit: PAGE_SIZE, offset }
    );
    if (items.length === 0) break;
    await EmailService.sendEmailToSegment(items as Contact[], subject, body);
    offset += items.length;
    if (items.length < PAGE_SIZE) break;
  }
}
