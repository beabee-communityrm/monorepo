import "module-alias/register";

import { In } from "typeorm";

import { database, log as mainLogger, emailService, newsletterService, contactsService } from "@beabee/core";
import { runApp } from "#express";
import { segmentService } from "#services"

import { Segment, SegmentOngoingEmail, SegmentContact } from "@beabee/models";
import currentLocale from "#locale";

const log = mainLogger.child({ app: "process-segments" });

async function processSegment(segment: Segment) {
  log.info("Process segment " + segment.name);

  const matchedContacts = await segmentService.getSegmentContacts(segment);

  const segmentContacts = await database.getRepository(SegmentContact).find({
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

  await database.getRepository(SegmentContact).delete({
    segmentId: segment.id,
    contactId: In(oldSegmentContactIds)
  });
  await database.getRepository(SegmentContact).insert(
    newContacts.map((contact) => ({ segment, contact }))
  );

  const outgoingEmails = await database.getRepository(SegmentOngoingEmail).find({
    where: { segmentId: segment.id },
    relations: { email: true }
  });

  // Only fetch old contacts if we need to
  const oldContacts =
    segment.newsletterTag ||
      outgoingEmails.some((oe) => oe.trigger === "onLeave")
      ? await contactsService.findByIds(oldSegmentContactIds)
      : [];

  for (const outgoingEmail of outgoingEmails) {
    const emailContacts =
      outgoingEmail.trigger === "onLeave"
        ? oldContacts
        : outgoingEmail.trigger === "onJoin"
          ? newContacts
          : [];
    if (emailContacts.length > 0) {
      await emailService.sendEmailToContact(outgoingEmail.email, emailContacts, currentLocale());
    }
  }

  if (segment.newsletterTag) {
    await newsletterService.addTagToContacts(
      newContacts,
      segment.newsletterTag
    );
    await newsletterService.removeTagFromContacts(
      oldContacts,
      segment.newsletterTag
    );
  }
}

async function main(segmentId?: string) {
  let segments: Segment[];
  if (segmentId) {
    const segment = await database.getRepository(Segment).findOneBy({ id: segmentId });
    if (segment) {
      segments = [segment];
    } else {
      log.info(`Segment ${segmentId} not found`);
      return;
    }
  } else {
    segments = await database.getRepository(Segment).find();
  }

  for (const segment of segments) {
    await processSegment(segment);
  }
}

runApp(async () => {
  await main(process.argv[2]);
});
