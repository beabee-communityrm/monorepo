import type { CommandDefinition } from '../../types/command.ts';

export const generateIndexDefinition: CommandDefinition = {
  name: 'generate-index',
  description:
    'Generate index.ts files that export all TypeScript files in specified directories',
  category: 'Code Generation',
  parameters: [
    {
      name: 'paths',
      type: 'array',
      description: 'Directories where index files should be generated',
      required: true,
      alias: 'p',
    },
    {
      name: 'extension',
      type: 'string',
      description: 'File extension to use for imports',
      required: false,
      default: 'js',
      choices: ['js', 'ts', 'none'],
      alias: 'ext',
    },
    {
      name: 'baseDir',
      type: 'string',
      description: 'Base directory to resolve paths from',
      required: false,
      default: process.cwd(),
      alias: 'b',
    },
  ],
  examples: [
    {
      command: 'generate-index -p ./src/types ./src/utils',
      description: 'Generate index files for types and utils directories',
    },
    {
      command: 'generate-index -p ./src/api --ext ts',
      description: 'Generate index files using .ts extensions',
    },
    {
      command: 'generate-index -p packages/common/src/types --baseDir .',
      description: 'Generate index for packages from monorepo root',
    },
  ],
};
