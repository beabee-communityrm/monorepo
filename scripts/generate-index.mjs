import fs from 'fs/promises';
import path from 'path';

// Simple script to generate index.js files for each folder
const paths = [
  "./src/types",
  "./src/error",
  "./src/utils",
  "./src/search",
];

const generateIndex = async (paths) => {
  for (const dir of paths) {
    const files = await fs.readdir(dir);
    // Sort files by file name
    files.sort((a, b) => a.localeCompare(b));

    let indexContent = "";

    for (const file of files) {
      if (
        (file.endsWith(".ts") || file.endsWith(".tsx")) &&
        file !== "index.ts"
      ) {
        indexContent += `export * from "./${file}";\n`;
      }
    }

    await fs.writeFile(path.join(dir, 'index.ts'), indexContent);
  }
};

await generateIndex(paths);