import { Argv } from 'yargs';
import { MigrateUploadsArgs } from '../types/index.js';

/**
 * This command is used to migrate images from local storage to our new Image and Document Services and MinIO storage.
 * It is used to migrate images from the old PictShare storage to the new Image and Document Services and MinIO storage.
 * It is a temporary command and will be removed once all instances have been successfully migrated.
 * @deprecated Deprecated from the start, as it is only a temporary migration script.
 */
export const migrateUploadsCommand = {
  command: 'migrate-uploads',
  describe:
    'Migrate uploads from local storage to MinIO using ImageService and DocumentService',
  builder: (yargs: Argv): Argv<MigrateUploadsArgs> => {
    return yargs
      .option('source', {
        describe: 'Source directory containing uploads to migrate',
        type: 'string',
        default: '/old_data',
      })
      .option('dryRun', {
        describe: 'Simulate migration without actually uploading files',
        type: 'boolean',
        default: false,
      })
      .option('steps', {
        describe:
          'List of migration steps to run. Allowed: calloutImages, optionImages, contentBackgroundImage, calloutResponseFiles. Default: all steps.',
        type: 'string',
        array: true,
        choices: [
          'calloutImages',
          'optionImages',
          'contentBackgroundImage',
          'calloutResponseFiles',
        ],
        default: [
          'calloutImages',
          'optionImages',
          'contentBackgroundImage',
          'calloutResponseFiles',
        ],
      });
  },
  handler: async (args: MigrateUploadsArgs): Promise<void> => {
    try {
      const { migrateUploads } = await import(
        '../actions/migrate-uploads/migrate-uploads.js'
      );
      await migrateUploads({
        source: args.source,
        dryRun: args.dryRun,
        steps: args.steps || [
          'calloutImages',
          'optionImages',
          'contentBackgroundImage',
          'calloutResponseFiles',
        ],
      });
    } catch (error) {
      console.error('Failed to migrate uploads:', error);
      process.exit(1);
    }
  },
};
