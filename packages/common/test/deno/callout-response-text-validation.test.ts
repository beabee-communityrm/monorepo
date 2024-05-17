import { assert } from "https://deno.land/std@0.212.0/assert/assert.ts";
import { assertEquals } from "https://deno.land/std@0.212.0/assert/assert_equals.ts";
import {
  CalloutComponentInputTextAreaSchema,
  calloutComponentInputTextValidator,
} from "../../mod.ts";
import { calloutTextarea1Form } from "./data/components/index.ts";

Deno.test("Validate callout textarea form response", async (t) => {
  await t.step(
    `"Hello world" should be valid answer without validation rules`,
    function () {
      const schema: CalloutComponentInputTextAreaSchema = {
        ...calloutTextarea1Form,
      };
      schema.validate = undefined;

      assert(
        calloutComponentInputTextValidator(schema, "Hello world"),
      );
    },
  );

  await t.step(
    `"Hello world" should be valid answer if answer is required`,
    function () {
      const schema: CalloutComponentInputTextAreaSchema = {
        ...calloutTextarea1Form,
      };
      schema.validate = {
        required: true,
      };

      assert(
        calloutComponentInputTextValidator(schema, "Hello world"),
      );
    },
  );

  await t.step(
    `"Hello world" should be valid answer for minLength 1 and maxLength 11 length validation rules`,
    function () {
      const schema: CalloutComponentInputTextAreaSchema = {
        ...calloutTextarea1Form,
      };
      schema.validate = {
        minLength: 1,
        maxLength: 11,
      };

      assert(
        calloutComponentInputTextValidator(schema, "Hello world"),
      );
    },
  );

  await t.step(
    `"Hello world" should be valid answer for minWords 1 and maxWords 2 validation rules`,
    function () {
      const schema: CalloutComponentInputTextAreaSchema = {
        ...calloutTextarea1Form,
      };
      schema.validate = {
        minWords: 1,
        maxWords: 2,
      };

      assert(
        calloutComponentInputTextValidator(schema, "Hello world"),
      );
    },
  );

  await t.step(
    `"Hello world" should be invalid answer for minLength 12 validation rule`,
    function () {
      const schema: CalloutComponentInputTextAreaSchema = {
        ...calloutTextarea1Form,
      };
      schema.validate = {
        minLength: 12,
      };

      assertEquals(
        calloutComponentInputTextValidator(schema, "Hello world"),
        false,
      );
    },
  );

  await t.step(
    `"Hello world" should be invalid answer for maxLength 9 validation rule`,
    function () {
      const schema: CalloutComponentInputTextAreaSchema = {
        ...calloutTextarea1Form,
      };
      schema.validate = {
        maxLength: 9,
      };

      assertEquals(
        calloutComponentInputTextValidator(schema, "Hello world"),
        false,
      );
    },
  );

  await t.step(
    `"Hello world" should be invalid answer for minWords 3 validation rule`,
    function () {
      const schema: CalloutComponentInputTextAreaSchema = {
        ...calloutTextarea1Form,
      };
      schema.validate = {
        minWords: 3,
      };

      assertEquals(
        calloutComponentInputTextValidator(schema, "Hello world"),
        false,
      );
    },
  );

  await t.step(
    `"Hello world" should be invalid answer for maxWords 1 validation rule`,
    function () {
      const schema: CalloutComponentInputTextAreaSchema = {
        ...calloutTextarea1Form,
      };
      schema.validate = {
        maxWords: 1,
      };

      assertEquals(
        calloutComponentInputTextValidator(schema, "Hello world"),
        false,
      );
    },
  );
});
