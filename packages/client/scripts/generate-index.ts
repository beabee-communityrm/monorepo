// Simple script to generate index.ts files for each folder
const paths = ["./src/types", "./src/api", "./src/utils"];

const encoder = new TextEncoder();

const generateIndex = (paths: string[]) => {
  for (const path of paths) {
    const files = [...Deno.readDirSync(path)];
    // Sort files by file name
    files.sort((a, b) => a.name.localeCompare(b.name));

    let indexContent = "";

    for (const file of files) {
      if (file.name.endsWith(".js") && file.name !== "index.js") {
        indexContent += `export * from "./${file.name}";\n`;
      }
    }

    Deno.writeFileSync(`${path}/index.ts`, encoder.encode(indexContent));
  }
};

generateIndex(paths);
