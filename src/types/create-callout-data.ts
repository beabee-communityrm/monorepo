import type {
  AllowNull,
  CalloutData,
  CalloutResponseViewSchema,
  GetCalloutFormData,
} from "./index.ts";

export type CreateCalloutData = AllowNull<
  & CalloutData
  & GetCalloutFormData
  & { responseViewSchema?: CalloutResponseViewSchema | null }
>;
