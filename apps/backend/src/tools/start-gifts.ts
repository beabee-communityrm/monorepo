import "module-alias/register";

import moment from "moment";
import { Between } from "typeorm";

import { runApp } from "#express";

import { database, GiftService, log as mainLogger } from "@beabee/core";

import { GiftFlow } from "@beabee/models";
import currentLocale from "#locale";

const log = mainLogger.child({ app: "start-gifts" });

async function main(date: string | undefined) {
  const fromDate = moment.utc(date).startOf("day");
  const toDate = moment.utc(date).endOf("day");

  log.info(
    `Processing gifts between ${fromDate.format()} and ${toDate.format()}`
  );

  const giftFlows = await database.getRepository(GiftFlow).find({
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
      await GiftService.processGiftFlow(giftFlow, currentLocale());
    } catch (error) {
      log.error(`Error prorcessing gift ${giftFlow.id}`, error);
    }
  }
}

runApp(async () => {
  await main(process.argv[2]);
});
