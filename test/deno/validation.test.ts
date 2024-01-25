import { assertEquals } from "https://deno.land/std@0.212.0/assert/assert_equals.ts";

Deno.test("Validate a full callout with form", async () => {
  const decoder = new TextDecoder("utf-8");
  const dataPath = new URL(
    "./data/full-callout-with-form.json",
    import.meta.url,
  );
  const data = await Deno.readFile(dataPath);
  const json = JSON.parse(decoder.decode(data));

  for (const slide of json.formSchema.slides) {
    for (const component of slide.components) {
      console.log(component);

      // TODO: Validation tests here
      assertEquals(typeof component.key !== "undefined", true);
    }
  }
});
