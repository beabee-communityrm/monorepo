import { log as mainLogger } from '@beabee/core/logging';
import { runApp } from '@beabee/core/server';

import { segmentsProcessJob } from '#jobs/segments-process';

// Cron entry point until the thin CLI triggers the job over the API
runApp(() =>
  segmentsProcessJob.run(
    { segmentId: process.argv[2] },
    mainLogger.child({ app: 'process-segments' })
  )
);
