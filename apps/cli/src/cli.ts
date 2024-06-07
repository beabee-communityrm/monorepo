#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run --allow-net
import yargs from "https://deno.land/x/yargs@v17.7.2-deno/deno.ts";
import { crossBuildAction, crossWatchAction, crossSyncAction, generateIndexAction, i18nAction } from "./actions/index.ts";

import type { BuildPlatform, BuildType } from "./types.ts";
import type { YargsInstance } from "https://deno.land/x/yargs@v17.7.2-deno/build/lib/yargs-factory.js";

yargs(Deno.args)
    .command(
        "cross-build [platform] [type]",
        "cross build a deno library for a specific platform and type",
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
        crossBuildAction,
    )
    .command(
        "cross-watch [platform] [type]",
        "watch a deno library for a specific platform and type to rebuild on changes",
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
        crossWatchAction,
    )
    .command(
        "generate-index <paths..>",
        "generate index.ts files for specific paths",
        (yargs: YargsInstance) => {
            return yargs.positional("paths", {
                describe: "the target paths to generate index.ts files for",
                type: "string",
            }).option("ext", {
                describe: "the file extension to use for the index.ts files",
                type: "string"
            });
        },
        generateIndexAction,
    )
    .command(
        "cross-sync",
        "sync package.json and deno.jsonc configurations",
        (yargs: YargsInstance) => yargs,
        crossSyncAction,
    )
    .command(
        "i18n [sheet-name]",
        "parse the google sheet and sync the locale files",
        (yargs: YargsInstance) => {
            return yargs.positional("sheet-name", {
                describe: "Additional sheet name to parse",
                type: "string",
            }).option("auth-json-file", {
                describe: "The path to the Google Auth JSON file",
                type: "string",
                default: "./.credentials.json",
            }).option("output-dir", {
                describe: "The path to the output directory",
                type: "string",
                default: "./locales",
            }).option("format", {
                describe: "The format of the output file",
                type: "string",
                choices: ["json", "js", "ts"],
                default: "json",
            });
        },
        i18nAction,
    )
    .strictCommands()
    .demandCommand(1)
    .scriptName("beabee-cli") // This is used to display the correct command name in the help output
    .help()
    .parse();
