import pg from 'pg';

/**
 * Run a query on the test stack's database, for state the API can't set or
 * doesn't expose
 * @returns The resulting rows
 */
export async function query<T extends pg.QueryResultRow>(
  text: string,
  values: unknown[]
): Promise<T[]> {
  if (!process.env.BEABEE_DATABASE_URL || !process.env.DB_PORT) {
    throw new Error('BEABEE_DATABASE_URL and DB_PORT must be set');
  }
  // The stack reaches the database by its service name, the tests through the
  // port it publishes
  const url = new URL(process.env.BEABEE_DATABASE_URL);
  url.hostname = 'localhost';
  url.port = process.env.DB_PORT;

  const client = new pg.Client({ connectionString: url.href });
  await client.connect();
  try {
    return (await client.query<T>(text, values)).rows;
  } finally {
    await client.end();
  }
}
