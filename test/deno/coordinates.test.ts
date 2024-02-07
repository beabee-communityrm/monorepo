import { assert } from "https://deno.land/std@0.212.0/assert/assert.ts";
import { isLngLat } from "../../mod.ts";

Deno.test("isLngLat test with", async (t) => {
  await t.step("a valid longitude/latitude pair", function () {
    assert(isLngLat([-73.935242, 40.730610]));
  });

  await t.step("a valid longitude/latitude paire", function () {
    assert(isLngLat([-180, 90]));
  });

  await t.step(
    "a valid longitude/latitude pair at the edge of the valid range",
    function () {
      assert(isLngLat([-180, 90]));
    },
  );

  await t.step(
    "a valid longitude/latitude pair at the other edge of the valid range",
    function () {
      assert(isLngLat([180, -90]));
    },
  );

  await t.step(
    "an invalid longitude/latitude pair (longitude out of range)",
    function () {
      assert(!isLngLat([-181, 40]));
    },
  );

  await t.step(
    "an invalid longitude/latitude pair (latitude out of range)",
    function () {
      assert(!isLngLat([-73, 91]));
    },
  );

  await t.step(
    "an invalid longitude/latitude pair (both longitude and latitude out of range)",
    function () {
      assert(!isLngLat([181, -91]));
    },
  );

  await t.step(
    "an invalid longitude/latitude pair (not a number)",
    function () {
      assert(!isLngLat(["not a number", 40]));
    },
  );

  await t.step("an invalid longitude/latitude pair (not a pair)", function () {
    assert(!isLngLat([-73]));
  });
});
