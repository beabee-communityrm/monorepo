import * as BeabeeCommon from "./index.ts";

declare global {
  interface Window {
    Beabee: {
      Common?: typeof BeabeeCommon;
    };
  }
}

(globalThis as unknown as Window).Beabee ||= {};
(globalThis as unknown as Window).Beabee.Common = BeabeeCommon;
