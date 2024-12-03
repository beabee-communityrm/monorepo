import { assertEquals } from "https://deno.land/std@0.212.0/assert/assert_equals.ts";
import { isTextInRange, isTextInWordRange } from "../../mod.ts";

Deno.test("isTextInRange", async (t) => {
  // Test case for a valid string within range
  await t.step("valid string within range", function () {
    assertEquals(
      isTextInRange("Hello", 1, 10),
      true,
      "Expected 'Hello' to be a valid string within range",
    );
  });

  // Test case for a valid string within range
  await t.step("valid string without range", function () {
    assertEquals(
      isTextInRange("Hello"),
      true,
      "Expected 'Hello' to be a valid string without a range",
    );
  });

  // Test case for a valid string at the minimum length
  await t.step("valid string at minimum length", function () {
    assertEquals(
      isTextInRange("H", 1, 10),
      true,
      "Expected 'H' to be a valid string at the minimum length",
    );
  });

  // Test case for a valid string at the maximum length
  await t.step("valid string at maximum length", function () {
    assertEquals(
      isTextInRange("Hello World", 1, 11),
      true,
      "Expected 'Hello World' to be a valid string at the maximum length",
    );
  });

  // Test case for an invalid string below minimum length
  await t.step("invalid string below minimum length", function () {
    assertEquals(
      isTextInRange("", 1, 10),
      false,
      "Expected empty string to be invalid as it is below the minimum length",
    );
  });

  // Test case for an invalid string above maximum length
  await t.step("invalid string above maximum length", function () {
    assertEquals(
      isTextInRange("Hello World!", 1, 10),
      false,
      "Expected 'Hello World!' to be invalid as it is above the maximum length",
    );
  });

  // Test case for a non-string value
  await t.step("non-string value", function () {
    assertEquals(
      isTextInRange(100, 1, 10),
      false,
      "Expected non-string value to be invalid",
    );
  });
});

Deno.test("isTextInWordRange", async (t) => {
  // Test case for a valid string at the minimum word length
  await t.step("valid string at minimum word length", function () {
    assertEquals(
      isTextInWordRange("Hello", 1),
      true,
      "Expected 'Hello' to be a valid string at the minimum word length",
    );
  });

  // Test case for a valid string at the minimum word length
  await t.step("valid string without a word range", function () {
    assertEquals(
      isTextInWordRange("Hello, how are you?"),
      true,
      "Expected 'Hello, how are you?' to be a valid string without a word range",
    );
  });

  // Test case for a valid string at the maximum word length
  await t.step("valid string at maximum word length", function () {
    assertEquals(
      isTextInWordRange("Hello World", 1, 2),
      true,
      "Expected 'Hello World' to be a valid string at the maximum word length",
    );
  });

  // Test case for an invalid string below minimum word length
  await t.step("invalid string below minimum word length", function () {
    assertEquals(
      isTextInWordRange("", 1),
      false,
      "Expected empty string to be invalid as it is below the minimum word length",
    );
  });

  // Test case for an invalid string above maximum word length
  await t.step("invalid string above maximum word length", function () {
    assertEquals(
      isTextInWordRange("Hello World, baby!", 1, 2),
      false,
      "Expected 'Hello World!' to be invalid as it is above the maximum word length",
    );
  });

  // Test case for a non-string value
  await t.step("non-string value", function () {
    assertEquals(
      isTextInWordRange(100, 1, 10),
      false,
      "Expected non-string value to be invalid",
    );
  });
});
