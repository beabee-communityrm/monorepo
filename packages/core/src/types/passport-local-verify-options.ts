import type { IVerifyOptions } from "passport-local";
import type { LOGIN_CODES } from "@beabee/beabee-common";

export type PassportLocalVerifyOptions = IVerifyOptions & {
  message: LOGIN_CODES | string;
};
