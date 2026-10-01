import { JobName } from '@beabee/beabee-common';
import { newsletterService } from '@beabee/core/services';

import { DryRunJobArgsDto } from '#api/dto/JobDto';
import type { Job } from '#type/job';

/** Refreshes the newsletter groups cached in the database from the provider */
export const newsletterRefreshCachedGroupsJob: Job<JobName.NewsletterRefreshCachedGroups> =
  {
    argsDto: DryRunJobArgsDto,
    async run(args, log) {
      log.info('Refreshing cached newsletter groups');

      if (args.dryRun) {
        log.info('DRY RUN - No changes will actually be made');
      }

      const { groupChanges } = await newsletterService.refreshNewsletterGroups(
        args.dryRun
      );

      if (groupChanges.length === 0) {
        log.info(
          '✅ Newsletter group cache is up to date, no changes required'
        );
        return;
      }

      log.info(`ℹ️ Updated cached groups with ${groupChanges.length} changes:`);
      for (const change of groupChanges) {
        log.info(`- ${change.action}: ${change.label} (${change.id})`);
      }
    },
  };
