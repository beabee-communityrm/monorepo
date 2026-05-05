import { runApp } from '@beabee/core/server';
import { optionsService } from '@beabee/core/services/OptionsService';

import type { SetOptionArgs } from '../../types/option.js';

/**
 * Sets an option value in the options table
 */
export const setOption = async (args: SetOptionArgs): Promise<void> => {
  await runApp(async () => {
    if (!optionsService.isKey(args.key)) {
      console.error(`Error: '${args.key}' is not a valid option key`);
      process.exit(1);
    }

    await optionsService.set(args.key, args.value);
    console.log(`Set '${args.key}' to '${args.value}'`);
  });
};
