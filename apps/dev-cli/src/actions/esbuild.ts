import { buildStandard } from '@beabee/esbuild';

import { resolve } from 'node:path';

import type { CommandResult, EsbuildArgs } from '../types/index.ts';

/**
 * Build packages using esbuild
 * @param argv Command arguments
 */
export const esbuild = async (argv: EsbuildArgs): Promise<void> => {
  const result = await esbuildWithResult(argv);

  if (result.success) {
    console.log(result.message);
  } else {
    console.error(result.error);
    process.exit(1);
  }
};

/**
 * Build packages using esbuild (returns CommandResult)
 * @param argv Command arguments
 */
export const esbuildWithResult = async (
  argv: EsbuildArgs
): Promise<CommandResult> => {
  const { entryPoints, watch, baseDir } = argv;

  try {
    await buildStandard({
      entryPoints,
      watch,
      baseDir,
    });

    return {
      success: true,
      message: watch
        ? `Build started in watch mode for ${entryPoints.length} entry points`
        : `Build completed successfully for ${entryPoints.length} entry points`,
      data: {
        entryPoints,
        watch,
        baseDir,
        mode: watch ? 'watch' : 'build',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Build failed: ${error instanceof Error ? error.message : String(error)}`,
      data: {
        entryPoints,
        watch,
        baseDir,
      },
    };
  }
};
