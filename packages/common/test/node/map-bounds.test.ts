import { assert } from "https://deno.land/std@0.212.0/assert/assert.ts";
import { isMapBounds } from "../../mod.ts";

Deno.test("isMapBounds", async (t) => {
  await t.step("valid map bounds", function () {
    assert(
      isMapBounds([[0, 0], [180, 90]]),
      "Expected [[0, 0], [180, 90]] to be valid map bounds",
    );
  });

  await t.step("valid map bounds with negative values", function () {
    assert(
      isMapBounds([[-180, -90], [180, 90]]),
      "Expected [[-180, -90], [180, 90]] to be valid map bounds",
    );
  });

  await t.step("invalid map bounds - not an array", function () {
    assert(
      !isMapBounds("not an array"),
      "Expected 'not an array' to be invalid map bounds",
    );
  });

  await t.step("invalid map bounds - array with wrong length", function () {
    assert(
      !isMapBounds([[0, 0]]),
      "Expected [[0, 0]] to be invalid map bounds",
    );
  });

  await t.step(
    "invalid map bounds - array with wrong element type",
    function () {
      assert(
        !isMapBounds([[0, 0], "not a lnglat"]),
        "Expected [[0, 0], 'not a lnglat'] to be invalid map bounds",
      );
    },
  );

  await t.step(
    "invalid map bounds - array with lnglat out of bounds",
    function () {
      assert(
        !isMapBounds([[0, 0], [181, 90]]),
        "Expected [[0, 0], [181, 90]] to be invalid map bounds",
      );
    },
  );
});
