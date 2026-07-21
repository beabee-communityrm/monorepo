import type { CommandModule } from 'yargs';

export const imageCommand: CommandModule = {
  command: 'image',
  describe: 'Manage uploaded images',
  builder: (yargs) =>
    yargs
      .command({
        command: 'backfill-dimensions',
        describe:
          'Store width/height in S3 metadata for images uploaded before dimensions were recorded',
        builder: (yargs) =>
          yargs.option('dryRun', {
            type: 'boolean',
            describe: 'Only report what would be updated',
            default: false,
          }),
        handler: async (argv) => {
          const { backfillDimensions } =
            await import('../actions/image/backfill-dimensions.js');
          return backfillDimensions(argv.dryRun as boolean);
        },
      })
      .demandCommand(1),
  handler: () => {},
};
