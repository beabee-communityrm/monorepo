import type { paths } from "./openapi.ts";

// Extract types directly from the OpenAPI schema
export type UnitUpdateRequestBody = NonNullable<
  paths["/units/{id}/"]["patch"]["requestBody"]
>["content"]["application/json"];

export type UnitResponseData = NonNullable<
  paths["/units/{id}/"]["get"]["responses"][200]["content"]
>["application/json"];

export type TranslationUnitResponseData = NonNullable<
  paths["/translations/{component__project__slug}/{component__slug}/{language__code}/units/"]["get"]["responses"][200]["content"]
>["application/json"] & {
  // TODO: Workaround for the fact that the response is not typed correctly
  results: UnitResponseData[];
};
