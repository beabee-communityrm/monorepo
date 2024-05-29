import type { GenerateIndexArguments } from "../types.ts";

const encoder = new TextEncoder();

const generateIndex = async (paths: string[]) => {
  for (const path of paths) {
    const files = await Array.fromAsync(Deno.readDir(path));
    // Sort files by file name
    files.sort((a, b) => a.name.localeCompare(b.name));

    let indexContent = "";

    for (const file of files) {
      if (
        (file.name.endsWith(".ts") || file.name.endsWith(".tsx")) &&
        file.name !== "index.ts"
      ) {
        indexContent += `export * from "./${file.name}";\n`;
      }
    }

    await Deno.writeFile(`${path}/index.ts`, encoder.encode(indexContent));
  }
};

/**
 * Generate index.ts files for specific paths.
 * @param argv 
 */
export const generateIndexAction = async (argv: GenerateIndexArguments) => {
  await generateIndex(argv.paths);
};
