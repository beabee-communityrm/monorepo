// Generate index.ts files for each folder
const paths = [
  "./src/data",
  "./src/error",
  "./src/search",
  "./src/types",
  "./src/utils",
  "./src/validators",
  "./test/deno/data",
  "./test/deno/data/components",
  "./test/deno/data/components/validate-rules",
];

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

await generateIndex(paths);
