import { JobName, NewsletterStatus } from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { ContactRole } from '@beabee/core/models';
import { newsletterBulkService, optionsService } from '@beabee/core/services';

import { Between } from 'typeorm';

import { NewsletterActiveMemberTagJobArgsDto } from '#api/dto/JobDto';
import type { Job } from '#type/job';

/**
 * Removes the active member tag on the newsletter service from contacts
 * whose membership expired in the given window
 */
export const newsletterActiveMemberTagJob: Job<JobName.NewsletterActiveMemberTag> =
  {
    argsDto: NewsletterActiveMemberTagJobArgsDto,
    async run(args, log) {
      const until = args.until ?? new Date();
      log.info(
        `Fetching memberships expired between ${args.since.toISOString()} and ${until.toISOString()}`
      );

      const memberships = await getRepository(ContactRole).find({
        where: { type: 'member', dateExpires: Between(args.since, until) },
        relations: { contact: { profile: true } },
      });

      log.info(`📊 Got ${memberships.length} memberships`);

      // Contacts who are no longer active members but still have a newsletter status
      const inactiveContacts = memberships
        .filter(
          (m) =>
            m.contact.profile.newsletterStatus !== NewsletterStatus.None &&
            !m.contact.membership?.isActive
        )
        .map((m) => m.contact);

      const activeMemberTag = optionsService.getText(
        'newsletter-active-member-tag'
      );

      if (args.dryRun) {
        log.info('DRY RUN - No changes will actually be made');
      }

      log.info(
        `🧹 Removing active member tag for ${inactiveContacts.length} contacts:`
      );
      for (const contact of inactiveContacts) {
        log.info(`  • ${contact.email}`);
      }

      if (!args.dryRun) {
        await newsletterBulkService.removeTagFromContacts(
          inactiveContacts,
          activeMemberTag
        );
      }

      log.info('✅ Done removing active member tag.');
    },
  };
