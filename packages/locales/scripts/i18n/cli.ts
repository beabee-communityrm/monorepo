#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run --allow-net
import yargs from "https://deno.land/x/yargs@v17.7.2-deno/deno.ts";
import { i18nAction } from "./actions/i18n.action.ts";

import type { YargsInstance } from "https://deno.land/x/yargs@v17.7.2-deno/build/lib/yargs-factory.js";

yargs(Deno.args)
    .command(
        "locales [sheet-name]",
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
