import {
  JobPayloadStripeSubscription,
  JobResultStripeSubscription,
  QUEUE,
  TaskRunnerWorkerService,
} from "@beabee/task-runner/src";
import { Job } from "bullmq";

import { contactsService, stripe } from "@beabee/core";

export class StripeSubscriptionHandler {
  constructor(taskRunnerWorkerService: TaskRunnerWorkerService) {
    const worker = taskRunnerWorkerService.create<
      JobPayloadStripeSubscription,
      JobResultStripeSubscription,
      "update"
    >(QUEUE.STRIPE_SUBSCRIPTION, this.update);
    worker.on("completed", (jobId, result) => {
      console.debug(
        `[StripeSubscriptionHandler] Job ${jobId} completed with result: ${result}`,
      );
    });
    worker.on("failed", (job, err) => {
      console.debug(
        `[StripeSubscriptionHandler] ${job.id} has failed with ${err.message}`,
      );
    });
    console.log("[StripeSubscriptionHandler] Worker started!");
  }

  /**
   * Handle the update job
   * @param job
   */
  async update(
    job: Job<
      JobPayloadStripeSubscription,
      JobResultStripeSubscription,
      "update"
    >,
  ) {
    console.debug("[StripeSubscriptionHandler] new update job", job);

    const result: JobResultStripeSubscription = {
      updatedSubscriptions: 0,
    };

    const contacts = await contactsService.find({
      relations: { contribution: true },
    });

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      if (!contact.contribution.subscriptionId) {
        console.warn(
          `[StripeSubscriptionHandler] Contact ${contact.id} has no subscriptionId`,
        );
        continue;
      }
      const subscriptionItems = await stripe.subscriptionItems.list({
        subscription: contact.contribution.subscriptionId,
      });
      for (const subscriptionItem of subscriptionItems.data) {
        await stripe.subscriptionItems.update(
          subscriptionItem.id,
          {
            tax_rates: [job.data.taxRateId],
          },
        );
        result.updatedSubscriptions++;
      }
      job.updateProgress(i / contacts.length * 100);
    }

    return result;
  }
}
