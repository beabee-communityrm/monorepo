import { runApp } from '@beabee/core/server';
import { Contact } from '@beabee/core/models';
import { getRepository } from '@beabee/core/database';
import { apiKeyService } from '@beabee/core/services/ApiKeyService';

import type { CreateApiKeyArgs } from '../../types/index.js';

export const createApiKey = async (argv: CreateApiKeyArgs): Promise<void> => {
  await runApp(async () => {
    // Get user for API key creation
    const apiUser = await getRepository(Contact).findOneOrFail({
      where: { email: argv.email },
      select: ['id', 'email', 'firstname', 'lastname', 'roles'],
    });

    if (!apiUser) {
      throw new Error(`No user found with email ${argv.email}`);
    }

    const expiryDate = argv.expires === 'never' ? null : new Date(argv.expires);

    const token = await apiKeyService.create(
      apiUser,
      argv.description,
      expiryDate
    );

    console.log('API key created successfully!');
    console.log('Token:', token);
  });
};
