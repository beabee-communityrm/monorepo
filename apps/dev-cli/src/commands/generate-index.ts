import type { CommandModule, ArgumentsCamelCase } from 'yargs';
import { generateIndex } from '../actions/index.ts';
import type { GenerateIndexArgs } from '../types/index.ts';

export const generateIndexCommand: CommandModule = {
  command: 'generate-index',
  describe: 'Generate index.ts files for specified directories',
  builder: (yargs) => {
    return yargs
      .option('paths', {
        alias: 'p',
        type: 'array',
        describe: 'Directories where index files should be generated',
        demandOption: true,
      })
      .option('extension', {
        alias: 'ext',
        type: 'string',
        describe: 'File extension to use for imports',
        choices: ['js', 'ts', 'none'],
        default: 'js',
      })
      .option('baseDir', {
        alias: 'b',
        type: 'string',
        describe: 'Base directory to resolve paths from',
        default: process.cwd(),
      })
      .example(
        'yarn dev-cli generate-index -p ./src/types ./src/utils',
        'Generate index files for types and utils directories'
      )
      .example(
        'yarn dev-cli generate-index -p ./src/api --ext ts',
        'Generate index files using .ts extensions'
      );
  },
  handler: (argv: any) => {
    // Cast to ensure string array for paths
    const args: GenerateIndexArgs = {
      paths: (argv.paths as string[]).filter(
        (p): p is string => typeof p === 'string'
      ),
      extension: argv.extension as 'js' | 'ts' | 'none',
      baseDir: argv.baseDir as string,
    };
    return generateIndex(args);
  },
};
