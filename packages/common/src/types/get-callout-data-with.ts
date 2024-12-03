import type {
  CalloutResponseViewSchema,
  CalloutVariantData,
  GetCalloutData,
  GetCalloutFormData,
  GetCalloutWith,
  Noop,
} from "./index.js";

export type GetCalloutDataWith<With extends GetCalloutWith> =
  & GetCalloutData
  & ("responseCount" extends With ? { responseCount: number } : Noop)
  & ("hasAnswered" extends With ? { hasAnswered: boolean } : Noop)
  & ("responseViewSchema" extends With
    ? { responseViewSchema: CalloutResponseViewSchema | null }
    : Noop)
  & ("form" extends With ? GetCalloutFormData : Noop)
  & ("variantNames" extends With ? { variantNames: string[] } : Noop)
  & ("variants" extends With ? { variants: Record<string, CalloutVariantData> }
    : Noop);
