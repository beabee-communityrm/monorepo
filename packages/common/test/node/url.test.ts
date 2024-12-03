import { assert } from "https://deno.land/std@0.212.0/assert/assert.ts";
import { isURL } from "../../mod.ts";

Deno.test("isURL", async (t) => {
  await t.step("valid URL", function () {
    assert(isURL("https://beabee.io/"));
  });

  await t.step("valid URL with www", function () {
    assert(isURL("https://www.beabee.io/"));
  });

  await t.step("valid URL with path", function () {
    assert(isURL("https://beabee.io/path/to/resource"));
  });

  await t.step("valid URL with query parameters", function () {
    assert(isURL("https://beabee.io/path?param1=value1&param2=value2"));
  });

  await t.step("valid URL with port", function () {
    assert(isURL("https://beabee.io:8080"));
  });

  await t.step("invalid URL missing protocol", function () {
    assert(!isURL("beabee.io"));
  });

  await t.step("invalid URL missing domain", function () {
    assert(!isURL("https://"));
  });

  await t.step("invalid URL with spaces", function () {
    assert(!isURL("https://bea bee.io"));
  });

  await t.step("invalid URL with multiple periods", function () {
    assert(!isURL("https://beabee..io"));
  });
});
