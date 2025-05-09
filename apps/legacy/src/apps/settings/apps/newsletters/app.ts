import { NewsletterStatus } from "@beabee/beabee-common";
import express, { type Express, type Request, type Response } from "express";
import moment from "moment";

import { log as mainLogger } from "@beabee/core/logging";
import { isSuperAdmin } from "#core/middleware";
import { wrapAsync } from "@beabee/core/utils/express";

import ContactsService from "@beabee/core/services/ContactsService";
import NewsletterService from "@beabee/core/services/NewsletterService";
import OptionsService from "@beabee/core/services/OptionsService";

import { NewsletterContact } from "@beabee/core/type";

import { Contact } from "@beabee/core/models";

import config from "@beabee/core/config";

const log = mainLogger.child({ app: "newsletter-settings" });

const app: Express = express();

app.set("views", __dirname + "/views");

app.use(isSuperAdmin);

app.get("/", (req: Request, res: Response) => {
  res.render("index", { provider: config.newsletter.provider });
});

async function setResyncStatus(message: string) {
  log.info("Resync status: " + message);
  await OptionsService.set(
    "newsletter-resync-status",
    `[${moment.utc().format("HH:mm DD/MM")}] ${message}`
  );
}

function groupsList(groups: string[]) {
  return groups
    .slice()
    .sort((a, b) => (a < b ? -1 : 1))
    .join(",");
}

function isMismatchedContact(contact: Contact, nlContact: NewsletterContact) {
  return (
    contact.profile.newsletterStatus !== nlContact.status ||
    groupsList(contact.profile.newsletterGroups) !==
      groupsList(nlContact.groups) ||
    !!contact.membership?.isActive !==
      nlContact.tags.includes(
        OptionsService.getText("newsletter-active-member-tag")
      )
  );
}

interface ReportData {
  uploadIds: string[];
  imports: {
    email: string;
    status: string;
    groups: string[];
  }[];
  mismatched: {
    id: string;
    status: string;
    groups: string[];
    tags: string[];
  }[];
}

async function handleResync(
  statusSource: "ours" | "theirs",
  opts: {
    updateThem: boolean;
    dryRun: boolean;
    removeUnsubscribed: boolean;
  }
) {
  try {
    await setResyncStatus("In progress: Fetching contact lists");

    const contacts = await ContactsService.find({
      relations: { profile: true }
    });
    const nlContacts = await NewsletterService.getNewsletterContacts();

    const newContactsToUpload: Contact[] = [],
      existingContacts: Contact[] = [],
      existingContactsToArchive: Contact[] = [],
      mismatchedContacts: [Contact, NewsletterContact][] = [];
    for (const contact of contacts) {
      const nlContact = nlContacts.find((nm) => nm.email === contact.email);
      if (nlContact) {
        existingContacts.push(contact);

        const status =
          statusSource === "ours"
            ? contact.profile.newsletterStatus
            : nlContact.status;
        if (
          status === NewsletterStatus.Unsubscribed &&
          opts.removeUnsubscribed
        ) {
          existingContactsToArchive.push(contact);
        }

        if (isMismatchedContact(contact, nlContact)) {
          mismatchedContacts.push([contact, nlContact]);
        }
      } else if (
        contact.profile.newsletterStatus === NewsletterStatus.Subscribed
      ) {
        newContactsToUpload.push(contact);
      }
    }

    const nlContactsToImport = nlContacts.filter(
      (nm) =>
        nm.status !== NewsletterStatus.Pending &&
        contacts.every((m) => m.email !== nm.email)
    );

    await OptionsService.set(
      "newsletter-resync-data",
      JSON.stringify({
        uploadIds: newContactsToUpload.map((m) => m.id),
        imports: nlContactsToImport.map((m) => ({
          email: m.email,
          status: m.status,
          groups: m.groups
        })),
        mismatched: mismatchedContacts.map(([m, nlm]) => ({
          id: m.id,
          status: nlm.status,
          groups: nlm.groups,
          tags: nlm.tags
        }))
      } as ReportData)
    );

    if (opts.dryRun) {
      await setResyncStatus(
        `DRY RUN: Successfully synced all contacts. ${nlContactsToImport.length} imported, ${mismatchedContacts.length} fixed, ${existingContactsToArchive.length} archived and ${newContactsToUpload.length} newly uploaded`
      );
      return;
    }

    if (opts.updateThem) {
      await setResyncStatus(
        `In progress: Uploading ${newContactsToUpload.length} new contacts to the newsletter list`
      );
      await NewsletterService.upsertContacts(newContactsToUpload);
    }

    // Must fix status before mass update to avoid overwriting in the wrong direction
    if (statusSource === "theirs") {
      await setResyncStatus(
        `In progress: Fixing ${mismatchedContacts.length} mismatched contacts`
      );

      for (const [contact, nlContact] of mismatchedContacts) {
        await ContactsService.updateContactProfile(
          contact,
          {
            newsletterStatus: nlContact.status,
            newsletterGroups: nlContact.groups
          },
          { sync: false }
        );
      }
    }

    if (opts.updateThem) {
      await setResyncStatus(
        `In progress: Updating ${existingContacts.length} contacts in newsletter list`
      );
      await NewsletterService.upsertContacts(existingContacts);

      // Sync tags before archiving
      await setResyncStatus(
        `In progress: Updating active member tag for ${mismatchedContacts.length} contacts in newsletter list`
      );

      await NewsletterService.addTagToContacts(
        mismatchedContacts
          .filter(([m]) => m.membership?.isActive)
          .map(([m]) => m),
        OptionsService.getText("newsletter-active-member-tag")
      );
      await NewsletterService.removeTagFromContacts(
        mismatchedContacts
          .filter(([m]) => !m.membership?.isActive)
          .map(([m]) => m),
        OptionsService.getText("newsletter-active-member-tag")
      );

      // TODO: Check other tags

      await setResyncStatus(
        `In progress: Archiving ${existingContactsToArchive.length} contacts from newsletter list`
      );
      await NewsletterService.archiveContacts(existingContactsToArchive);
    }

    await setResyncStatus(
      `In progress: Importing ${nlContactsToImport.length} contacts from newsletter list`
    );

    for (const nlContact of nlContactsToImport) {
      await ContactsService.createContact(
        {
          email: nlContact.email,
          firstname: nlContact.firstname,
          lastname: nlContact.lastname,
          joined: nlContact.joined
        },
        {
          newsletterStatus: nlContact.status,
          newsletterGroups: nlContact.groups
        },
        { sync: false }
      );
    }

    if (opts.updateThem) {
      await setResyncStatus(
        `Successfully synced all contacts. ${nlContactsToImport.length} imported, ${mismatchedContacts.length} fixed, ${existingContactsToArchive.length} archived, ${newContactsToUpload.length} newly uploaded`
      );
    } else {
      await setResyncStatus(
        `Successfully synced all contacts. ${nlContactsToImport.length} imported, ${mismatchedContacts.length} fixed`
      );
    }
  } catch (error: any) {
    log.error("Newsletter sync failed", error);
    await setResyncStatus("Error: " + error.message);
  }
}

app.post(
  "/",
  wrapAsync(async (req, res) => {
    if (req.body.action === "resync") {
      await setResyncStatus("In progress: initialising resync");
      req.flash("success", "newsletter-resync-started");
      res.redirect(req.originalUrl);

      handleResync(req.body.statusSource, {
        updateThem: req.body.updateThem === "true",
        dryRun: req.body.dryRun === "true",
        removeUnsubscribed: req.body.removeUnsubscribed === "true"
      });
    }
  })
);

app.get(
  "/report",
  wrapAsync(async (req, res) => {
    const data = OptionsService.getJSON("newsletter-resync-data") as ReportData;
    const newContactsToUpload = await ContactsService.findByIds(data.uploadIds);
    const mismatchedContacts = await ContactsService.findByIds(
      data.mismatched.map((m) => m.id),
      { relations: { profile: true } }
    );

    res.render("report", {
      contactsToImport: data.imports,
      newContactsToUpload,
      mismatchedContacts: data.mismatched.map((m) => ({
        ...m,
        contact: mismatchedContacts.find((m2) => m.id === m2.id)
      }))
    });
  })
);

export default app;
