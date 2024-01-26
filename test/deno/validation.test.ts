import { assertEquals } from "https://deno.land/std@0.212.0/assert/assert_equals.ts";
import { calloutFull1 } from "./data/index.ts";

Deno.test("Validate a full callout with form", () => {
  for (const slide of calloutFull1.formSchema.slides) {
    for (const component of slide.components) {
      // TODO: Validation tests here
      assertEquals(typeof component.key !== "undefined", true);
    }
  }
});
