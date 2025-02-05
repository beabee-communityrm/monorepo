import "module-alias/register";

import moment from "moment";
import { Between } from "typeorm";

import { getRepository } from "@beabee/core/database";
import { log as mainLogger } from "@beabee/core/logging";
import { runApp } from "@beabee/core/server";

import GiftService from "@beabee/core/services/GiftService";

import { GiftFlow } from "@beabee/core/models";

const log = mainLogger.child({ app: "start-gifts" });

/**
 * @deprecated This tool is deprecated and will be removed in the next major version.
 * Please use the new backend-cli process gifts command instead: yarn backend-cli process gifts
 */
async function main(date: string | undefined) {
  const fromDate = moment.utc(date).startOf("day");
  const toDate = moment.utc(date).endOf("day");

  log.info(
    `Processing gifts between ${fromDate.format()} and ${toDate.format()}`
  );

  const giftFlows = await getRepository(GiftFlow).find({
    where: {
      giftForm: { startDate: Between(fromDate.toDate(), toDate.toDate()) },
      completed: true,
      processed: false
    }
  });

  log.info(`Got ${giftFlows.length} gifts to process`);

  for (const giftFlow of giftFlows) {
    log.info(`Processing gift ${giftFlow.id}`);

    try {
      await GiftService.processGiftFlow(giftFlow);
    } catch (error) {
      log.error(`Error prorcessing gift ${giftFlow.id}`, error);
    }
  }
}

runApp(async () => {
  console.warn(
    "\n⚠️  DEPRECATED: This start-gifts tool is deprecated and will be removed in the next major version.\n" +
      "Please use the new backend-cli process gifts command instead: yarn backend-cli process gifts\n"
  );

  await main(process.argv[2]);
});
