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
          yargs.option('danger', {
            type: 'boolean',
            description:
              'Make the changes; without this flag the command only reports what it would do',
            default: false,
          }),
        handler: async (argv) => {
          const { backfillDimensions } =
            await import('../actions/image/backfill-dimensions.js');
          return backfillDimensions(argv.danger);
        },
      })
      .demandCommand(1),
  handler: () => {},
};
