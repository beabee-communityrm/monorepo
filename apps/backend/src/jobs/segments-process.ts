import { GetContactWith, JobName } from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { InvalidRuleError } from '@beabee/core/errors';
import { Segment, SegmentOngoingEmail } from '@beabee/core/models';
import { newsletterBulkService } from '@beabee/core/services';
import ContactsService from '@beabee/core/services/ContactsService';
import EmailService from '@beabee/core/services/EmailService';
import SegmentService from '@beabee/core/services/SegmentService';

import { SegmentsProcessJobArgsDto } from '#api/dto/JobDto';
import ContactTransformer from '#api/transformers/ContactTransformer';
import type { Job, JobLogger } from '#type/job';

/**
 * Updates the contact list of a segment, triggering the configured emails and
 * newsletter tags for contacts that joined or left since the last run
 */
async function processSegment(segment: Segment, log: JobLogger) {
  log.info('Process segment ' + segment.name);

  const { items: matchedContacts } = await ContactTransformer.fetchRaw(
    { method: 'internal', roles: ['admin'] },
    {
      limit: -1,
      rules: segment.ruleGroup,
      with: [GetContactWith.Profile, GetContactWith.Roles],
    }
  );

  const existingContactIds = await SegmentService.getSegmentContactIds(
    segment.id
  );
  const existingIdSet = new Set(existingContactIds);
  const matchedIdSet = new Set(matchedContacts.map((m) => m.id));

  const newContacts = matchedContacts.filter((m) => !existingIdSet.has(m.id));
  const oldSegmentContactIds = existingContactIds.filter(
    (id) => !matchedIdSet.has(id)
  );

  log.info(
    `Segment ${segment.name} has ${existingContactIds.length} existing contacts, ${newContacts.length} new contacts and ${oldSegmentContactIds.length} old contacts`
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

  await SegmentService.removeContactsFromSegment(
    segment.id,
    oldSegmentContactIds
  );
  await SegmentService.addContactsToSegment(
    segment.id,
    newContacts.map((c) => c.id)
  );
}

/** Processes one segment by ID, or every segment */
export const segmentsProcessJob: Job<JobName.SegmentsProcess> = {
  argsDto: SegmentsProcessJobArgsDto,
  async run(args, log) {
    let segments: Segment[];
    if (args.segmentId) {
      const segment = await getRepository(Segment).findOneBy({
        id: args.segmentId,
      });
      if (!segment) {
        throw new Error(`Segment ${args.segmentId} not found`);
      }
      segments = [segment];
    } else {
      segments = await getRepository(Segment).find();
    }

    for (const segment of segments) {
      try {
        await processSegment(segment, log);
      } catch (err) {
        // An invalid rule is a configuration problem, not a failure of the run
        if (err instanceof InvalidRuleError) {
          log.warning(
            `Invalid rule for segment ${segment.name}: ${err.message}`
          );
        } else {
          throw err;
        }
      }
    }
  },
};
