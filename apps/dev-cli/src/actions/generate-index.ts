import { readdir, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

import type { GenerateIndexArgs } from '../types/index.ts';

/**
 * Generate index.ts files for specified directories
 * @param argv Command arguments
 */
export const generateIndex = async (argv: GenerateIndexArgs): Promise<void> => {
  const { paths, extension, baseDir } = argv;

  console.log(`Generating index files for ${paths.length} directories...`);
  console.log(
    `Using extension: ${extension === 'none' ? 'none' : `.${extension}`}`
  );

  for (const path of paths) {
    const fullPath = resolve(baseDir, path);
    const directoryName = basename(path);
    const isTypesDirectory = directoryName === 'types';

    try {
      // Read directory contents asynchronously
      const files = await readdir(fullPath, { withFileTypes: true });
      // Sort files by file name
      files.sort((a, b) => a.name.localeCompare(b.name));

      let indexContent = '';

      for (const file of files) {
        if (
          file.name.endsWith('.ts') &&
          file.name !== 'index.ts' &&
          !file.name.endsWith('.test.ts')
        ) {
          const importName = basename(file.name, '.ts');
          const importExtension = getImportExtension(extension);
          const exportPrefix = isTypesDirectory
            ? 'export type * from'
            : 'export * from';
          indexContent += `${exportPrefix} './${importName}${importExtension}';\n`;
        }
      }

      // If no files were found to export, add an empty export
      if (indexContent === '') {
        indexContent = 'export {};\n';
      }

      // Write file asynchronously
      console.log(
        `Generated index for: ${path}${isTypesDirectory ? ' (using type exports)' : ''}`
      );
      await writeFile(`${fullPath}/index.ts`, indexContent, 'utf-8');
    } catch (error) {
      console.error(`Error processing ${path}:`, error);
    }
  }

  console.log('Index file generation completed!');
};

/**
 * Get the correct import extension based on configuration
 */
function getImportExtension(extension: 'js' | 'ts' | 'none'): string {
  switch (extension) {
    case 'js':
      return '.js';
    case 'ts':
      return '.ts';
    case 'none':
      return '';
    default:
      return '.js';
  }
}
