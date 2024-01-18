import type { BaseCalloutComponentSchema } from "./index.ts";

export interface InputCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type:
  | "address"
  | "button"
  | "checkbox"
  | "email"
  | "file"
  | "number"
  | "password"
  | "textfield"
  | "textarea"
  | "content"
  | "phoneNumber"
  | "currency"
  | "datetime"
  | "time"
  | "url"
  | "signature";
  input: true;
  filePattern?: string;
  placeholder?: string;
}
