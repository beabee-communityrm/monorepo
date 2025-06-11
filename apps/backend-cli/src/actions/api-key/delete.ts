import { runApp } from '@beabee/core/server';
import { apiKeyService } from '@beabee/core/services/ApiKeyService';

import type { DeleteApiKeyArgs } from '../../types/index.js';

export const deleteApiKey = async (argv: DeleteApiKeyArgs): Promise<void> => {
  await runApp(async () => {
    const success = await apiKeyService.delete(argv.id);

    if (success) {
      console.log('API key deleted successfully!');
    } else {
      console.error('API key not found');
      process.exit(1);
    }
  });
};
