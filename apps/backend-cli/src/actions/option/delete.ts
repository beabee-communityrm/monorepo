import { runApp } from '@beabee/core/server';
import { optionsService } from '@beabee/core/services/OptionsService';

import type { DeleteOptionArgs } from '../../types/option.js';

/**
 * Deletes (resets to default) an option in the options table
 */
export const deleteOption = async (args: DeleteOptionArgs): Promise<void> => {
  await runApp(async () => {
    if (!optionsService.isKey(args.key)) {
      console.error(`Error: '${args.key}' is not a valid option key`);
      process.exit(1);
    }

    await optionsService.reset(args.key);
    console.log(`Reset '${args.key}' to default value`);
  });
};
