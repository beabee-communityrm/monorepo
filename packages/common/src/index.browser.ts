// deno-lint-ignore-file
import * as BeabeeCommon from "./index.ts";

declare global {
    var Beabee: {
        Common: typeof BeabeeCommon;
    };
}

// @ts-ignore
globalThis.Beabee ||= {};

globalThis.Beabee.Common = BeabeeCommon;
