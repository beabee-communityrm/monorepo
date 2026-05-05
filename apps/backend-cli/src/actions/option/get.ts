import { runApp } from '@beabee/core/server';
import { optionsService } from '@beabee/core/services/OptionsService';

import type { GetOptionArgs } from '../../types/option.js';

/**
 * Gets option value(s) from the options table
 */
export const getOption = async (args: GetOptionArgs): Promise<void> => {
  await runApp(async () => {
    if (args.all) {
      const allOptions = optionsService.getAll();
      console.log('All options:');
      console.log('-------------------');
      for (const [key, option] of Object.entries(allOptions)) {
        console.log(`${key}: ${option.value} (default: ${option.default})`);
      }
      return;
    }

    if (!args.key) {
      console.error('Error: Please provide a key with --key or use --all');
      process.exit(1);
    }

    if (!optionsService.isKey(args.key)) {
      console.error(`Error: '${args.key}' is not a valid option key`);
      process.exit(1);
    }

    const option = optionsService.get(args.key);
    console.log(`${args.key}: ${option.value} (default: ${option.default})`);
  });
};
