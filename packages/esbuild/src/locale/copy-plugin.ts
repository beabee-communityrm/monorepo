import type { Plugin } from 'esbuild';
import { existsSync, watch } from 'node:fs';
import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { CopyPluginOptions } from '../types/index.ts';
import { getTimestamp } from '../utils.ts';

/**
 * Creates a plugin that copies locale JSON files to the output directory
 */
export function createCopyPlugin({
  sourceDir,
  outdir,
  dirName,
  isWatch,
}: CopyPluginOptions): Plugin {
  return {
    name: `copy-plugin-${dirName}`,
    setup(build: any) {
      let copying = false;

      const copyFiles = async () => {
        if (copying) return;
        copying = true;

        try {
          // Ensure output directory exists
          const localesOutDir = join(outdir, 'locales');
          if (!existsSync(localesOutDir)) {
            await mkdir(localesOutDir, { recursive: true });
          }

          // Copy JSON files
          const files = await readdir(sourceDir);
          const jsonFiles = files.filter((file) => file.endsWith('.json'));

          for (const file of jsonFiles) {
            const sourcePath = join(sourceDir, file);
            const targetPath = join(localesOutDir, file);
            await copyFile(sourcePath, targetPath);
          }

          console.log(
            `📋 [${getTimestamp()}] ${dirName} copied ${jsonFiles.length} locale files`
          );
        } catch (error) {
          console.error(
            `❌ [${getTimestamp()}] ${dirName} copy failed:`,
            error
          );
        } finally {
          copying = false;
        }
      };

      // Initial copy on build
      build.onEnd(copyFiles);

      // Watch mode: Monitor source files for changes
      if (isWatch) {
        const watcher = watch(
          sourceDir,
          { recursive: true },
          async (eventType, filename) => {
            if (filename && filename.endsWith('.json')) {
              console.log(
                `📄 [${getTimestamp()}] ${dirName} detected change: ${filename}`
              );
              await copyFiles();
            }
          }
        );

        build.onDispose(() => {
          watcher.close();
        });
      }
    },
  };
}
