import type { CommandModule, ArgumentsCamelCase } from "yargs";
import { esbuild } from "../actions/index.ts";
import type { EsbuildArgs } from "../types/index.ts";

export const esbuildCommand: CommandModule = {
  command: "esbuild",
  describe: "Build packages using esbuild",
  builder: (yargs) => {
    return yargs
      .option("globalName", {
        alias: "global",
        type: "string",
        describe: "Global name for browser builds",
        demandOption: true
      })
      .option("entryPoints", {
        alias: "entry",
        type: "array",
        describe: "Entry points for the build",
        default: ["./src/index.ts", "./src/**/*.ts"]
      })
      .option("watch", {
        alias: "w",
        type: "boolean",
        describe: "Enable watch mode",
        default: false
      })
      .option("baseDir", {
        alias: "b",
        type: "string",
        describe: "Base directory to resolve paths from",
        default: process.cwd()
      })
      .example(
        "yarn dev-cli esbuild --global BeabeeCommon",
        "Build the common package"
      )
      .example(
        "yarn dev-cli esbuild --global BeabeeClient --watch",
        "Build the client package in watch mode"
      );
  },
  handler: (argv: any) => {
    // Cast to ensure proper types
    const args: EsbuildArgs = {
      globalName: argv.globalName as string,
      entryPoints: (argv.entryPoints as string[]).filter(
        (e): e is string => typeof e === "string"
      ),
      watch: argv.watch as boolean,
      baseDir: argv.baseDir as string
    };
    return esbuild(args);
  }
};
