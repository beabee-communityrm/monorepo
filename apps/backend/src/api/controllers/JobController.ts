import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import {
  Authorized,
  Body,
  JsonController,
  Params,
  Post,
  Res,
} from 'routing-controllers';

import { RunJobDto } from '#api/dto/JobDto';
import { JobNameParams } from '#api/params/JobNameParams';
import { validateOrReject } from '#api/utils';
import { jobs } from '#jobs/index';
import { lockJob, runJob } from '#jobs/run';

@JsonController('/jobs')
export class JobController {
  /**
   * Runs a Job and streams its progress as NDJSON: one `log` line per
   * message, then one `result` line. The response stays open for as long as
   * the job runs, so this route has no timeout. Superadmin covers operators
   * and excludes API keys, which can never hold that role.
   */
  @Post('/:name')
  @Authorized('superadmin')
  async runJob(
    @Params() { name }: JobNameParams,
    @Body() data: RunJobDto,
    @Res() res: Response
  ): Promise<Response> {
    const job = jobs[name];
    // A job without arguments has an empty DTO, which class-validator would
    // otherwise refuse as an unknown value; unknown properties still fail
    const args = plainToInstance(job.argsDto, data.args);
    await validateOrReject(args, { forbidUnknownValues: false });

    const release = lockJob(name);
    try {
      res.setTimeout(0);
      // Tells nginx not to buffer, should the stream ever pass the router
      res.set('X-Accel-Buffering', 'no');
      res.status(200).type('application/x-ndjson').flushHeaders();
      await runJob(
        name,
        job,
        args,
        { actorType: data.actor, actorId: null },
        (line) => res.write(JSON.stringify(line) + '\n')
      );
    } finally {
      release();
      res.end();
    }
    return res;
  }
}
