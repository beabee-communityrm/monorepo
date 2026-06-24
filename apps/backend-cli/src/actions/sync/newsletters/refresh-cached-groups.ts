import { log as mainLogger } from '@beabee/core/logging';
import { runApp } from '@beabee/core/server';
import { newsletterService } from '@beabee/core/services';

const log = mainLogger.child({ app: 'sync-newsletter-refresh-cached-groups' });

export const refreshCachedGroups = async (): Promise<void> => {
  await runApp(async () => {
    log.info('Refreshing cached newsletter groups');

    const { groupChanges } = await newsletterService.refreshNewsletterGroups();

    if (groupChanges.length === 0) {
      log.info('✅ Newsletter group cache is up to date, no changes required');
      return;
    }

    log.info(`ℹ️ Updated cached groups with ${groupChanges.length} changes:`);
    for (const change of groupChanges) {
      log.info(`- ${change.action}: ${change.label} (${change.id})`);
    }
  });
};
