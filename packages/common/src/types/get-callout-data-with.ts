import type {
  CalloutResponseViewSchema,
  CalloutVariantData,
  GetCalloutData,
  GetCalloutFormData,
  GetCalloutWith,
  Noop,
} from "./index.ts";

export type GetCalloutDataWith<With extends GetCalloutWith> =
  & GetCalloutData
  & ("form" extends With ? GetCalloutFormData : Noop)
  & ("hasAnswered" extends With ? { hasAnswered: boolean } : Noop)
  & ("responseCount" extends With ? { responseCount: number } : Noop)
  & ("responseViewSchema" extends With
    ? { responseViewSchema: CalloutResponseViewSchema | null }
    : Noop)
  & ("variantNames" extends With ? { variantNames: string[] } : Noop)
  & ("variants" extends With ? { variants: Record<string, CalloutVariantData> }
    : Noop);
