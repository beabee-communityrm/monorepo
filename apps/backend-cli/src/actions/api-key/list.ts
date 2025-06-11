import { runApp } from '@beabee/core/server';
import { getRepository } from '@beabee/core/database';
import { ApiKey } from '@beabee/core/models';

export const listApiKeys = async (): Promise<void> => {
  await runApp(async () => {
    const apiKeys = await getRepository(ApiKey).find({
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });

    if (apiKeys.length === 0) {
      console.log('No API keys found');
      return;
    }

    console.log('\nAPI Keys:');
    console.log('--------------------------------------------------');
    for (const key of apiKeys) {
      console.log(`ID: ${key.id}`);
      console.log(`Description: ${key.description}`);
      console.log(
        `Created by: ${key.creator ? `${key.creator.firstname} ${key.creator.lastname} (${key.creator.email})` : 'Unknown'}`
      );
      console.log(`Created at: ${key.createdAt.toISOString()}`);
      console.log(
        `Expires: ${key.expires ? key.expires.toISOString() : 'Never'}`
      );
      console.log('--------------------------------------------------');
    }
  });
};
