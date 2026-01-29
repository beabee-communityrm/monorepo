import type { Plugin } from 'esbuild';
import { existsSync, watch } from 'node:fs';
import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { CopyPluginOptions } from '../types/index.ts';
import { getTimestamp } from '../utils.ts';

/** Copies locale JSON files from sourceDir to outdir/locales. Optionally watches for changes. */
export function createCopyPlugin({
  sourceDir,
  outdir,
  dirName,
  isWatch,
}: CopyPluginOptions): Plugin {
  return {
    name: `copy-plugin-${dirName}`,
    setup(build: {
      onEnd: (fn: () => Promise<void>) => void;
      onDispose?: (fn: () => void) => void;
    }) {
      let busy = false;

      const run = async () => {
        if (busy) return;
        busy = true;
        try {
          const dest = join(outdir, 'locales');
          if (!existsSync(dest)) await mkdir(dest, { recursive: true });

          const files = await readdir(sourceDir);
          const jsonFiles = files.filter((f) => f.endsWith('.json'));

          for (const f of jsonFiles) {
            await copyFile(join(sourceDir, f), join(dest, f));
          }
          console.log(
            `📋 [${getTimestamp()}] ${dirName} copied ${jsonFiles.length} locale files`
          );
        } catch (err) {
          console.error(`❌ [${getTimestamp()}] ${dirName} copy failed:`, err);
        } finally {
          busy = false;
        }
      };

      build.onEnd(run);

      if (isWatch) {
        const watcher = watch(sourceDir, { recursive: true }, (_, filename) => {
          if (filename?.endsWith('.json')) run();
        });
        build.onDispose?.(() => watcher.close());
      }
    },
  };
}
