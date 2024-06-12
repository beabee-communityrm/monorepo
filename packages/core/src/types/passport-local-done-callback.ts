import type { Contact } from "@beabee/models";
import type { HttpError } from "routing-controllers";
import type { UnauthorizedError } from "#errors/UnauthorizedError";
import type { PassportLocalVerifyOptions } from "#types/passport-local-verify-options";

export type PassportLocalDoneCallback = (
  error: null | HttpError | UnauthorizedError,
  user: Contact | false,
  options?: PassportLocalVerifyOptions | undefined
) => void;
