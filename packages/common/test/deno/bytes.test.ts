import { assertEquals } from "https://deno.land/std@0.212.0/assert/assert_equals.ts";
import { toBytes } from "../../mod.ts";

Deno.test("toBytes", async (t) => {
  // Test case for a valid bytes conversion
  await t.step("valid bytes conversion", function () {
    assertEquals(
      toBytes("1KB"),
      1024,
      "Expected 1KB to be converted to 1024 bytes",
    );
  });

  // Test case for a valid bytes conversion with different units
  await t.step("valid bytes conversion with different units", function () {
    assertEquals(
      toBytes("1MB"),
      1024 * 1024,
      "Expected 1MB to be converted to 1048576 bytes",
    );
  });

  // Test case for a valid bytes conversion with large units
  await t.step("valid bytes conversion with large units", function () {
    assertEquals(
      toBytes("1GB"),
      1024 * 1024 * 1024,
      "Expected 1GB to be converted to 1073741824 bytes",
    );
  });

  // Test case for an invalid bytes conversion
  await t.step("invalid bytes conversion", function () {
    assertEquals(
      toBytes("1AB"),
      null,
      "Expected 1AB to be invalid and return null",
    );
  });

  // Test case for an empty string
  await t.step("empty string", function () {
    assertEquals(
      toBytes(""),
      null,
      "Expected empty string to be invalid and return null",
    );
  });

  // Test case for a non-string value
  await t.step("non-string value", function () {
    assertEquals(
      toBytes(100),
      null,
      "Expected non-string value to be invalid and return null",
    );
  });
});
