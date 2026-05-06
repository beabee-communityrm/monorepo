import type { CommandModule } from 'yargs';

import { generateClassIndex } from '../actions/index.ts';
import type { GenerateClassIndexArgs } from '../types/index.ts';

export const generateClassIndexCommand: CommandModule = {
  command: 'generate-class-index',
  describe:
    'Generate an index file with explicit class imports and an aggregated array export (e.g. TypeORM entities/migrations)',
  builder: (yargs) => {
    return yargs
      .option('src', {
        type: 'string',
        describe: 'Directory of .ts files to scan',
        demandOption: true,
      })
      .option('out', {
        type: 'string',
        describe: 'Output file path',
        demandOption: true,
      })
      .option('export-name', {
        type: 'string',
        describe: 'Name of the exported const array',
        demandOption: true,
      })
      .option('class-name-strategy', {
        type: 'string',
        describe:
          'How to derive the class name. "filename" matches the file name (e.g. TypeORM entities); "parse" extracts it from `export class X` (e.g. TypeORM migrations)',
        choices: ['filename', 'parse'],
        default: 'filename',
      })
      .option('baseDir', {
        alias: 'b',
        type: 'string',
        describe: 'Base directory to resolve paths from',
        default: process.cwd(),
      })
      .option('check', {
        type: 'boolean',
        describe:
          'Verify the output file is up to date without writing. Exits non-zero on drift.',
        default: false,
      })
      .example(
        'yarn dev-cli generate-class-index --src ./src/models --out ./src/entities.ts --export-name entities --class-name-strategy filename',
        'Generate a class array from filename-matching classes (e.g. TypeORM entities)'
      )
      .example(
        'yarn dev-cli generate-class-index --src ./src/migrations --out ./src/migrations.ts --export-name migrations --class-name-strategy parse',
        'Generate a class array by parsing `export class` from each file (e.g. TypeORM migrations)'
      );
  },
  handler: (argv: any) => {
    const args: GenerateClassIndexArgs = {
      srcDir: argv.src as string,
      outFile: argv.out as string,
      exportName: argv['export-name'] as string,
      classNameStrategy: argv['class-name-strategy'] as 'filename' | 'parse',
      baseDir: argv.baseDir as string,
      check: argv.check as boolean,
    };
    return generateClassIndex(args);
  },
};
