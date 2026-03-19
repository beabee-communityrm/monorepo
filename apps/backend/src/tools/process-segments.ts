// TODO: Port this to apps/backend-cli/src/actions/sync/segments.ts.
// To do that, we have to package ContactTransformer e.g. to @beabee/transformers.
import { GetContactWith } from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { InvalidRuleError } from '@beabee/core/errors';
import { log as mainLogger } from '@beabee/core/logging';
import {
  Segment,
  SegmentContact,
  SegmentOngoingEmail,
} from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import { newsletterBulkService } from '@beabee/core/services';
import ContactsService from '@beabee/core/services/ContactsService';
import EmailService from '@beabee/core/services/EmailService';

import { In } from 'typeorm';

import ContactTransformer from '#api/transformers/ContactTransformer';

const log = mainLogger.child({ app: 'process-segments' });

/**
 * Update the contacts list for a segment, checking which contacts have been
 * added or removed since the last run and triggering any relevant emails or
 * updating associated newsletter tags.
 *
 * @param segment The segment to process
 */
async function processSegment(segment: Segment) {
  log.info('Process segment ' + segment.name);

  const { items: matchedContacts } = await ContactTransformer.fetchRaw(
    { method: 'internal', roles: ['admin'] },
    {
      limit: -1,
      rules: segment.ruleGroup,
      with: [GetContactWith.Profile, GetContactWith.Roles],
    }
  );

  const segmentContacts = await getRepository(SegmentContact).find({
    where: { segmentId: segment.id },
  });

  const newContacts = matchedContacts.filter((m) =>
    segmentContacts.every((sm) => sm.contactId !== m.id)
  );
  const oldSegmentContactIds = segmentContacts
    .filter((sm) => matchedContacts.every((m) => m.id !== sm.contactId))
    .map((sm) => sm.contactId);

  log.info(
    `Segment ${segment.name} has ${segmentContacts.length} existing contacts, ${newContacts.length} new contacts and ${oldSegmentContactIds.length} old contacts`
  );

  const outgoingEmails = await getRepository(SegmentOngoingEmail).find({
    where: { segmentId: segment.id, enabled: true },
    relations: { email: true },
  });

  // Only fetch old contacts if we need to
  const oldContacts =
    segment.newsletterTag ||
    outgoingEmails.some((oe) => oe.trigger === 'onLeave')
      ? await ContactsService.findByIds(oldSegmentContactIds, {
          relations: { profile: true },
        })
      : [];

  if (segment.newsletterTag) {
    await newsletterBulkService.addTagToContacts(
      newContacts,
      segment.newsletterTag
    );
    await newsletterBulkService.removeTagFromContacts(
      oldContacts,
      segment.newsletterTag
    );
  }

  for (const outgoingEmail of outgoingEmails) {
    const emailContacts =
      outgoingEmail.trigger === 'onLeave'
        ? oldContacts
        : outgoingEmail.trigger === 'onJoin'
          ? newContacts
          : [];
    if (emailContacts.length > 0) {
      await EmailService.sendEmailToContact(outgoingEmail.email, emailContacts);
    }
  }

  await getRepository(SegmentContact).delete({
    segmentId: segment.id,
    contactId: In(oldSegmentContactIds),
  });
  await getRepository(SegmentContact).insert(
    newContacts.map((contact) => ({ segment, contact }))
  );
}

/**
 * Process segments, either a specific one by ID or all segments.
 */
async function main(segmentId?: string) {
  let segments: Segment[];
  if (segmentId) {
    const segment = await getRepository(Segment).findOneBy({ id: segmentId });
    if (segment) {
      segments = [segment];
    } else {
      log.info(`Segment ${segmentId} not found`);
      return;
    }
  } else {
    segments = await getRepository(Segment).find();
  }

  for (const segment of segments) {
    try {
      await processSegment(segment);
    } catch (err) {
      // Catch InvalidRuleError to reduce logging noise during cronjob runs.
      // This error is expected and does not require escalation.
      if (err instanceof InvalidRuleError) {
        log.warning(
          'Invalid rule for segment %s: %s',
          segment.name,
          err.message
        );
      } else {
        throw err;
      }
    }
  }
}

runApp(async () => {
  await main(process.argv[2]);
});
