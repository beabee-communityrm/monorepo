export const rateLimiterCommand = {
  command: 'rate-limiter',
  describe: 'Manage rate limiter functionality',
  builder: (yargs: any) => {
    return yargs
      .command({
        command: 'clear',
        describe: 'Clear the rate limiter cache',
        builder: (yargs: any) => {
          return yargs.option('force', {
            type: 'boolean',
            describe: 'Force clear even if not in dev mode',
            default: false,
          });
        },
        handler: async (argv: any) => {
          const { clearRateLimiterCache } = await import(
            '../actions/rate-limiter/clear.js'
          );
          await clearRateLimiterCache(argv.force);
        },
      })
      .demandCommand(1, 'You need to specify a subcommand');
  },
  handler: () => {
    // This is required by yargs but not used since we have subcommands
  },
};
