// Build Node.js ESM module with esbuild.
import { buildStandard } from "@beabee/esbuild";

const entryPoints = ["./src/index.ts", "./src/**/*.ts"];

await buildStandard("@beabee/client", entryPoints, "BeabeeClient").catch(
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
