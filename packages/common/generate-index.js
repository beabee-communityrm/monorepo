// Simple script to generate index.ts files for each folder
import { readdir, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

const paths = ["./src/data", "./src/error", "./src/search", "./src/types", "./src/utils", "./src/validators"];

const generateIndex = async (paths) => {
  for (const path of paths) {
    // Read directory contents asynchronously
    const files = await readdir(path, { withFileTypes: true });
    // Sort files by file name
    files.sort((a, b) => a.name.localeCompare(b.name));

    let indexContent = "";

    for (const file of files) {
      if (file.name.endsWith(".ts") && file.name !== "index.ts") {
        indexContent += `export * from "./${basename(file.name, ".ts")}.js";\n`;
      }
    }

    // Write file asynchronously
    console.log("indexContent", indexContent);
    await writeFile(`${path}/index.ts`, indexContent, 'utf-8');
  }
};

// Execute and handle potential errors
await generateIndex(paths).catch(console.error);
