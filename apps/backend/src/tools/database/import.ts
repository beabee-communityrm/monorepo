import 'module-alias/register';

import config from '@beabee/core/config';
import { dataSource } from '@beabee/core/database';
import { runApp } from '@beabee/core/server';

import readline from 'readline';

if (!config.dev) {
  console.error("Can't import to live database");
  process.exit(1);
}

runApp(async () => {
  // File format: first line is SQL, second is params (repeated)
  await dataSource.manager.transaction(async (manager) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    let query = '';
    for await (const line of rl) {
      if (query) {
        console.log('Running ' + query.substring(0, 100) + '...');
        await manager.query(query, line !== '' ? JSON.parse(line) : undefined);
        query = '';
      } else {
        query = line;
      }
    }
  });
});
