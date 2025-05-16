// TODO: Port this to apps/backend-cli/src/actions/sync/segments.ts.
// To do that, we have to package ContactTransformer e.g. to @beabee/transformers.

import "module-alias/register";

import { In } from "typeorm";

import { getRepository } from "@beabee/core/database";
import { log as mainLogger } from "@beabee/core/logging";
import { runApp } from "@beabee/core/server";

import EmailService from "@beabee/core/services/EmailService";
import NewsletterService from "@beabee/core/services/NewsletterService";
import ContactsService from "@beabee/core/services/ContactsService";

import {
  Segment,
  SegmentOngoingEmail,
  SegmentContact
} from "@beabee/core/models";
import ContactTransformer from "@api/transformers/ContactTransformer";
import { GetContactWith } from "@beabee/beabee-common";
import { InvalidRuleError } from "@beabee/core/errors";

const log = mainLogger.child({ app: "process-segments" });

async function processSegment(segment: Segment) {
  log.info("Process segment " + segment.name);

  const { items: matchedContacts } = await ContactTransformer.fetchRaw(
    { method: "internal", roles: ["admin"] },
    {
      limit: -1,
      rules: segment.ruleGroup,
      with: [GetContactWith.Profile, GetContactWith.Roles]
    }
  );

  const segmentContacts = await getRepository(SegmentContact).find({
    where: { segmentId: segment.id }
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

  await getRepository(SegmentContact).delete({
    segmentId: segment.id,
    contactId: In(oldSegmentContactIds)
  });
  await getRepository(SegmentContact).insert(
    newContacts.map((contact) => ({ segment, contact }))
  );

  const outgoingEmails = await getRepository(SegmentOngoingEmail).find({
    where: { segmentId: segment.id, enabled: true },
    relations: { email: true }
  });

  // Only fetch old contacts if we need to
  const oldContacts =
    segment.newsletterTag ||
    outgoingEmails.some((oe) => oe.trigger === "onLeave")
      ? await ContactsService.findByIds(oldSegmentContactIds)
      : [];

  for (const outgoingEmail of outgoingEmails) {
    const emailContacts =
      outgoingEmail.trigger === "onLeave"
        ? oldContacts
        : outgoingEmail.trigger === "onJoin"
          ? newContacts
          : [];
    if (emailContacts.length > 0) {
      await EmailService.sendEmailToContact(outgoingEmail.email, emailContacts);
    }
  }

  if (segment.newsletterTag) {
    await NewsletterService.addTagToContacts(
      newContacts,
      segment.newsletterTag
    );
    await NewsletterService.removeTagFromContacts(
      oldContacts,
      segment.newsletterTag
    );
  }
}

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
      if (err instanceof InvalidRuleError) {
        log.warning(
          "Invalid rule for segment %s: %s",
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
