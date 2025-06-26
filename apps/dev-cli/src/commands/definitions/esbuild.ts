import type { CommandDefinition } from '../../types/command.ts';

export const esbuildDefinition: CommandDefinition = {
  name: 'esbuild',
  description: 'Build packages using the shared esbuild configuration',
  category: 'Build',
  parameters: [
    {
      name: 'entryPoints',
      type: 'array',
      description: 'Entry points for the build',
      required: false,
      default: ['./src/index.ts', './src/**/*.ts'],
      alias: 'entry',
    },
    {
      name: 'watch',
      type: 'boolean',
      description: 'Enable watch mode for continuous rebuilding',
      required: false,
      default: false,
      alias: 'w',
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
      command: 'esbuild',
      description: 'Build a package with default entry points',
    },
    {
      command: 'esbuild --watch',
      description: 'Build with watch mode for continuous rebuilding',
    },
    {
      command: 'esbuild --entry ./src/main.ts ./src/helpers/**/*.ts',
      description: 'Build with custom entry points',
    },
    {
      command: 'esbuild --baseDir packages/vue',
      description: 'Build from specific directory',
    },
  ],
};
