import yargs from "https://deno.land/x/yargs@v17.7.2-deno/deno.ts";
import { buildAction, syncAction, watchAction, generateIndexAction } from "./actions/index.ts";

import type { BuildPlatform, BuildType } from "./types.ts";
import type { YargsInstance } from "https://deno.land/x/yargs@v17.7.2-deno/build/lib/yargs-factory.js";

yargs(Deno.args)
    .command(
        "build [platform] [type]",
        "build for a specific platform and type",
        (yargs: YargsInstance) => {
            const types: BuildType[] = ["cdn", "cjs", "esm"];
            const platforms: BuildPlatform[] = ["node", "browser"];
            return yargs.positional("platform", {
                describe: "the target platform to build for",
                choices: platforms,
            }).positional("type", {
                describe: "the target type to build for",
                choices: types,
            });
        },
        buildAction,
    )
    .command(
        "watch [platform] [type]",
        "watch for a specific platform and type",
        (yargs: YargsInstance) => {
            const types: BuildType[] = ["cdn", "cjs", "esm"];
            const platforms: BuildPlatform[] = ["node", "browser"];
            return yargs.positional("platform", {
                describe: "the target platform to watch for",
                choices: platforms,
            }).positional("type", {
                describe: "the target type to watch for",
                choices: types,
            });
        },
        watchAction,
    )
    .command(
        "generate-index <paths..>",
        "generate index.ts files for specific paths",
        (yargs: YargsInstance) => {
            return yargs.positional("paths", {
                describe: "the target paths to generate index.ts files for",
                type: "string",
            })
        },
        generateIndexAction,
    )
    .command(
        "sync",
        "sync runtime configurations between package.json and deno.json",
        (yargs: YargsInstance) => yargs,
        syncAction,
    )
    .strictCommands()
    .demandCommand(1)
    .help()
    .parse();
