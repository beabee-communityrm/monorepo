// deno-lint-ignore-file
import * as beabeeCommon from "./index.ts";

(globalThis as any).Beabee ||= {};
(globalThis as any).Beabee.Common = beabeeCommon;

export default beabeeCommon;
