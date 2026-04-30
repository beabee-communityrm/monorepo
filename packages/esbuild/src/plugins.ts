import type { Plugin } from 'esbuild';

import { getTimestamp } from './utils.ts';

/**
 * Creates a plugin that logs build completion and errors during watch mode
 */
export function createWatchLoggerPlugin(name: string): Plugin {
  return {
    name: `watch-logger-${name}`,
    setup(build: any) {
      build.onEnd((result: any) => {
        if (result.errors.length > 0) {
          console.log(
            `🔴 [${getTimestamp()}] ${name} build failed with ${result.errors.length} errors`
          );
        } else {
          console.log(`✅ [${getTimestamp()}] ${name} rebuild completed`);
        }
      });
    },
  };
}
