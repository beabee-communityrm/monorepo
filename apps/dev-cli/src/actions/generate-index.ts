import { readdir, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

import type { CommandResult, GenerateIndexArgs } from '../types/index.ts';

/**
 * Generate index.ts files for specified directories
 * @param argv Command arguments
 */
export const generateIndex = async (argv: GenerateIndexArgs): Promise<void> => {
  const result = await generateIndexWithResult(argv);

  if (result.success) {
    console.log(result.message);
    if (result.data?.details) {
      result.data.details.forEach((detail: string) =>
        console.log(`  ${detail}`)
      );
    }
  } else {
    console.error(result.error);
    process.exit(1);
  }
};

/**
 * Generate index.ts files for specified directories (returns CommandResult)
 * @param argv Command arguments
 */
export const generateIndexWithResult = async (
  argv: GenerateIndexArgs
): Promise<CommandResult> => {
  const { paths, extension, baseDir } = argv;

  try {
    const details: string[] = [];
    const processedPaths: string[] = [];

    details.push(`Generating index files for ${paths.length} directories...`);
    details.push(
      `Using extension: ${extension === 'none' ? 'none' : `.${extension}`}`
    );

    for (const path of paths) {
      const fullPath = resolve(baseDir, path);

      try {
        // Read directory contents asynchronously
        const files = await readdir(fullPath, { withFileTypes: true });
        // Sort files by file name
        files.sort((a, b) => a.name.localeCompare(b.name));

        let indexContent = '';
        const exportedFiles: string[] = [];

        for (const file of files) {
          if (file.name.endsWith('.ts') && file.name !== 'index.ts') {
            const importName = basename(file.name, '.ts');
            const importExtension = getImportExtension(extension);
            indexContent += `export * from "./${importName}${importExtension}";\n`;
            exportedFiles.push(file.name);
          }
        }

        // If no files were found to export, add an empty export
        if (indexContent === '') {
          indexContent = 'export {};\n';
        }

        // Write file asynchronously
        await writeFile(`${fullPath}/index.ts`, indexContent, 'utf-8');

        details.push(
          `✓ Generated index for: ${path} (${exportedFiles.length} files exported)`
        );
        processedPaths.push(path);
      } catch (error) {
        const errorMsg = `✗ Error processing ${path}: ${error instanceof Error ? error.message : String(error)}`;
        details.push(errorMsg);
      }
    }

    return {
      success: true,
      message: `Index file generation completed! Processed ${processedPaths.length}/${paths.length} directories.`,
      data: {
        processedPaths,
        totalPaths: paths.length,
        details,
        extension,
        baseDir,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Index file generation failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
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
