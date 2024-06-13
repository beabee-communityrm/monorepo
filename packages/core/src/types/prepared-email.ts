import type { Email } from "@beabee/models";

export interface PreparedEmail extends Email {
  fromEmail: string;
  fromName: string;
}
