import { buildStandard } from "@beabee/esbuild";

const entryPoints = ["./src/index.ts", "./src/**/*.ts"];

await buildStandard("@beabee/common", entryPoints, "BeabeeCommon").catch(
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
