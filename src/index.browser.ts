// deno-lint-ignore-file
import * as BeabeeCommon from "./index.ts";

(globalThis as any).Beabee ||= {};
(globalThis as any).Beabee.Common = BeabeeCommon;
