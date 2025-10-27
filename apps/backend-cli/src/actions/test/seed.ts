import { runApp } from '@beabee/core/server';
import { writeJsonToDB } from '@beabee/core/tools/database/anonymisers/index';

/**
 * Load a JSON dump to seed the database with test data using TypeORM repositories.
 *
 * @param dryRun If true, only logs what would be done (not used here, for API consistency)
 * @param filePath Full path to the JSON dump file
 */
export const seed = async (
  dryRun = false,
  filePath?: string
): Promise<void> => {
  await runApp(async () => {
    await writeJsonToDB(dryRun, filePath);
  });
};
