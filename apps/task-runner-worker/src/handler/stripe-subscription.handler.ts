import { JobPayloadStripeSubscription, TaskRunnerWorkerService, QUEUE } from "@beabee/task-runner/src";
import { Job } from "bullmq";

// import { stripeProvider } from "@beabee/core/src";

export class StripeSubscriptionHandler {
    constructor(taskRunnerWorkerService: TaskRunnerWorkerService) {
        const worker = taskRunnerWorkerService.create<JobPayloadStripeSubscription, null, 'update'>(QUEUE.STRIPE_SUBSCRIPTION, this.update);
        worker.on('completed', (jobId, result) => {
            console.debug(`[StripeSubscriptionHandler] Job ${jobId} completed with result: ${result}`);
        });
        worker.on("failed", (job, err) => {
            console.debug(`[StripeSubscriptionHandler] ${job.id} has failed with ${err.message}`);
        });
        console.log("[StripeSubscriptionHandler] Worker started!");
    }

    /**
     * Handle the update job
     * @param job 
     */
    update(job: Job<JobPayloadStripeSubscription, null, 'update'>) {
        console.debug("[StripeSubscriptionHandler] new update job", job.name);
        return null;
    }
}
