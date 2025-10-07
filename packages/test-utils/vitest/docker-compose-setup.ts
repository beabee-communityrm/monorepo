import { config } from 'dotenv';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { DockerComposeEnvironment, Wait } from 'testcontainers';
import type { StartedDockerComposeEnvironment } from 'testcontainers';

const rootPath = resolve(process.cwd() + '/../..');
const envDev = config({ path: [rootPath + '/.env'], override: false });
const envTest = config({
  path: [rootPath + '/.env.test'],
  override: true,
});
const env = { ...envDev.parsed, ...envTest.parsed };

const testUserEmail = env.TEST_USER_EMAIL;
// todo move to database dump?
const createTestUserCommand = `yarn backend-cli user create --firstname ${env.TEST_USER_FIRSTNAME} --lastname ${env.TEST_USER_LASTNAME} --email ${testUserEmail} --password ${env.TEST_USER_PASSWORD} --role ${env.TEST_USER_ROLE}`;
// todo move to database dump?
const createRateLimitTestUserCommand = `yarn backend-cli user create --firstname ${env.TEST_RATE_LIMIT_USER_FIRSTNAME} --lastname ${env.TEST_RATE_LIMIT_USER_LASTNAME} --email ${env.TEST_RATE_LIMIT_USER_EMAIL} --password ${env.TEST_RATE_LIMIT_USER_PASSWORD} --role ${env.TEST_RATE_LIMIT_USER_ROLE}`;
// todo could be replaced by database dump?
const createTestApiKeyCommand = `yarn backend-cli api-key create --description ${env.TEST_API_KEY_DESCRIPTION} --email ${testUserEmail}`;

// Create test payments with different amounts and periods (at least 10 for pagination)
export const createTestPaymentsCommands = [
  // Create payments with different amounts and periods
  `yarn backend-cli payment create --email ${testUserEmail} --amount 10 --period monthly`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 20 --period monthly`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 30 --period monthly`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 40 --period monthly`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 50 --period monthly`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 60 --period annually`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 70 --period annually`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 80 --period annually`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 90 --period annually`,
  `yarn backend-cli payment create --email ${testUserEmail} --amount 100 --period annually`,
];

const seedCommand = `yarn backend-cli test seed --dry-run false`;

const anonymisedCommand = `yarn backend-cli test anonymise --dry-run false`;

const uploadTestUserDataCommand = `yarn backend-cli test seed --dry-run false --fileName test-user-data.json`;

const apiAppLogs = {
  data: [] as string[],
  err: [] as string[],
};

let startedDockerComposeEnvironment: StartedDockerComposeEnvironment | null =
  null;

export async function setup() {
  console.log('Starting Docker Compose environment...');

  try {
    const dockerComposeEnv = new DockerComposeEnvironment(
      rootPath,
      'docker-compose.test.yml'
    )
      .withEnvironment(env)
      .withProjectName(env.COMPOSE_PROJECT_NAME || 'beabee-test')
      .withWaitStrategy(
        'db',
        Wait.forLogMessage(/database system is ready to accept connections/)
      )
      .withWaitStrategy(
        'api_app',
        Wait.forLogMessage(/Server is ready and listening on port 3000/)
      )
      .withWaitStrategy(
        'minio',
        Wait.forLogMessage(/MinIO server is running.../)
      );

    startedDockerComposeEnvironment = await dockerComposeEnv.up();
    console.log('✅ All services started successfully');

    const apiApp = startedDockerComposeEnvironment.getContainer('api_app-1');

    // Log the apiApp logs
    (await apiApp.logs())
      .on('data', (line) => {
        apiAppLogs.data.push(line);
        if (env.DEBUG_LOGS) {
          console.log(`[API_APP] ${line}`);
        }
      })
      .on('err', (line) => {
        apiAppLogs.err.push(line);
        if (env.DEBUG_LOGS) {
          console.log(`[API_APP_ERROR] ${line}`);
        }
      })
      .on('end', () => console.log('API app log stream closed'));

    // Create test user
    console.log('Creating test user...');
    await apiApp.exec(createTestUserCommand.split(' '));

    // Create rate limit test user
    console.log('Creating rate limit test user...');
    await apiApp.exec(createRateLimitTestUserCommand.split(' '));

    // console.log('Loading test user, rate limit user and test api key...');
    // await apiApp.exec(uploadTestUserDataCommand);

    // Create test API key
    console.log('Creating test API key...');
    const apiKeyOutput = await apiApp.exec(createTestApiKeyCommand.split(' '));

    const token = apiKeyOutput.output.match(/Token: (.+)/)?.[1];
    if (token) {
      console.log('✅ Test API key created');
      process.env.API_KEY = token.trim();
    } else {
      throw new Error('Failed to create test API key: ' + apiKeyOutput.output);
    }

    console.log('✅ Setup completed successfully');
  } catch (error) {
    console.log('❌ Setup failed');
    console.log(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

export async function setupPayments() {
  // Create test payments
  console.log(`Creating ${createTestPaymentsCommands.length} test payments...`);

  // TODO: is there a better way of doing this? How can I call the backend-cli in the tests?
  // At the moment startedDockerComposeEnvironment is not available in beforeAll hooks
  for (const command of createTestPaymentsCommands) {
    execSync('docker exec beabee-test-api_app-1 ' + command);
  }
  console.log('✅ Test payments created');
}

export async function teardown() {
  console.log('Tearing down Docker Compose environment...');

  try {
    if (startedDockerComposeEnvironment) {
      await startedDockerComposeEnvironment.down();
      console.log('✅ Docker Compose environment stopped');
    }

    // Log the apiApp logs, not set by default
    if (env.DEBUG_LOGS) {
      if (apiAppLogs.data.length > 0) {
        console.log(`API App data logs (${apiAppLogs.data.length} entries):`);
        apiAppLogs.data.forEach((log, index) => {
          console.log(`  [${index + 1}] ${log}`);
        });
      }
      if (apiAppLogs.err.length > 0) {
        console.log(`API App error logs (${apiAppLogs.err.length} entries):`);
        apiAppLogs.err.forEach((log, index) => {
          console.log(`  [${index + 1}] ${log}`);
        });
      }
    }
  } catch (error) {
    console.log('❌ Teardown failed');
    console.log(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}
