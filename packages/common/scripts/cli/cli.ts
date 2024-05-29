import yargs from "https://deno.land/x/yargs@v17.7.2-deno/deno.ts";
import { buildAction } from "./actions/build.ts";
import { watchAction } from "./actions/watch.ts";
import { buildAllAction } from "./actions/buildAll.ts";

import type { BuildPlatform, BuildType } from "./types.ts";
import type { YargsInstance } from "https://deno.land/x/yargs@v17.7.2-deno/build/lib/yargs-factory.js";

yargs(Deno.args)
    .command(
        "build <platform> <type>",
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
        "build-all",
        "build for all platforms and types",
        (yargs: YargsInstance) => yargs,
        buildAllAction,
    )
    .command(
        "watch <platform> <type>",
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
    .strictCommands()
    .demandCommand(1)
    .help()
    .parse();
