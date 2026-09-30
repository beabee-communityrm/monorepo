import {
  ActivityActorType,
  type JobLogLine,
  JobName,
} from '@beabee/beabee-common';
import { JobClient } from '@beabee/client';
import { api, testUser } from '@beabee/test-utils/test-data';

import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';

function operatorToken() {
  if (!process.env.BEABEE_SERVICE_SECRET) {
    throw new Error('BEABEE_SERVICE_SECRET must be set to run these tests');
  }
  return jwt.sign({}, process.env.BEABEE_SERVICE_SECRET, {
    algorithm: 'HS256',
    issuer: 'operator',
  });
}

describe('Jobs API', () => {
  it('runs a job and streams its log lines', async () => {
    const jobClient = new JobClient({
      host: api.host,
      path: api.path,
      token: operatorToken(),
    });
    const lines: JobLogLine[] = [];
    await jobClient.run(
      JobName.DatabaseClean,
      { args: {}, actor: ActivityActorType.BackendCLI },
      (line) => lines.push(line)
    );
    expect(lines.length).toBe(3);
    expect(lines.every((l) => l.level === 'info')).toBe(true);
    expect(lines[0].message).toMatch(/^Cleaned \d+ records from/);
  });

  it('rejects an unknown job', async () => {
    const jobClient = new JobClient({
      host: api.host,
      path: api.path,
      token: operatorToken(),
    });
    await expect(
      // Deliberately not a JobName, the server must refuse it
      jobClient.run('no-such-job' as JobName, {
        args: {},
        actor: ActivityActorType.BackendCLI,
      })
    ).rejects.toMatchObject({ httpCode: 400 });
  });

  it('refuses an API key, which is never superadmin', async () => {
    const jobClient = new JobClient({
      host: api.host,
      path: api.path,
      token: testUser.apiKey,
    });
    await expect(
      jobClient.run(JobName.DatabaseClean, {
        args: {},
        actor: ActivityActorType.BackendCLI,
      })
    ).rejects.toMatchObject({ httpCode: 403 });
  });
});
