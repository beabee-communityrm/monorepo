export * from "./types/index.ts";
import * as BeabeeClient from "./api/index.ts";
import * as Utils from "./utils/index.ts";

declare global {
    var Beabee: {
        Client: typeof BeabeeClient;
        Utils: typeof Utils;
    };
}

// @ts-ignore
globalThis.Beabee ||= {};

globalThis.Beabee.Client = BeabeeClient;
globalThis.Beabee.Utils = Utils;
