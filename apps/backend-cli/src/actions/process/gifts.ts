import { getRepository } from '@beabee/core/database';
import { log as mainLogger } from '@beabee/core/logging';
import { GiftFlow } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import { GiftService } from '@beabee/core/services/GiftService';

import moment from 'moment';
import { Between } from 'typeorm';

import { ProcessGiftsArgs } from '../../types/process.js';

const log = mainLogger.child({ app: 'process-gifts' });

export const processGifts = async (args: ProcessGiftsArgs): Promise<void> => {
  await runApp(async () => {
    const fromDate = moment.utc(args.date).startOf('day');
    const toDate = moment.utc(args.date).endOf('day');

    log.info(
      `Processing gifts between ${fromDate.format()} and ${toDate.format()}`
    );

    const giftFlows = await getRepository(GiftFlow).find({
      where: {
        giftForm: { startDate: Between(fromDate.toDate(), toDate.toDate()) },
        completed: true,
        processed: false,
      },
    });

    log.info(`Got ${giftFlows.length} gifts to process`);

    if (args.dryRun) {
      log.info('DRY RUN - Following actions would be performed:');
      for (const giftFlow of giftFlows) {
        log.info(
          `- Would process gift ${giftFlow.id} for ${giftFlow.giftForm.email}`
        );
      }
      log.info('\nDRY RUN - No changes were made');
      return;
    }

    for (const giftFlow of giftFlows) {
      log.info(`Processing gift ${giftFlow.id}`);
      try {
        await GiftService.processGiftFlow(giftFlow);
      } catch (error) {
        log.error(`Error processing gift ${giftFlow.id}`, error);
      }
    }
  });
};
