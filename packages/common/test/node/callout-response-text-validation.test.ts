import {
  CalloutComponentInputTextAreaSchema,
  calloutComponentInputTextValidator
} from "@beabee/beabee-common";
import { calloutTextarea1Form } from "./data/components/index.js";

describe("Validate callout textarea form response", () => {
  test("'Hello world' should be valid answer without validation rules", () => {
    const schema: CalloutComponentInputTextAreaSchema = {
      ...calloutTextarea1Form
    };
    schema.validate = undefined;

    expect(calloutComponentInputTextValidator(schema, "Hello world")).toBe(
      true
    );
  });

  test("'Hello world' should be valid answer if answer is required", () => {
    const schema: CalloutComponentInputTextAreaSchema = {
      ...calloutTextarea1Form
    };
    schema.validate = {
      required: true
    };

    expect(calloutComponentInputTextValidator(schema, "Hello world")).toBe(
      true
    );
  });

  test("'Hello world' should be valid answer for minLength 1 and maxLength 11 length validation rules", () => {
    const schema: CalloutComponentInputTextAreaSchema = {
      ...calloutTextarea1Form
    };
    schema.validate = {
      minLength: 1,
      maxLength: 11
    };

    expect(calloutComponentInputTextValidator(schema, "Hello world")).toBe(
      true
    );
  });

  test("'Hello world' should be valid answer for minWords 1 and maxWords 2 validation rules", () => {
    const schema: CalloutComponentInputTextAreaSchema = {
      ...calloutTextarea1Form
    };
    schema.validate = {
      minWords: 1,
      maxWords: 2
    };

    expect(calloutComponentInputTextValidator(schema, "Hello world")).toBe(
      true
    );
  });

  test("'Hello world' should be invalid answer for minLength 12 validation rule", () => {
    const schema: CalloutComponentInputTextAreaSchema = {
      ...calloutTextarea1Form
    };
    schema.validate = {
      minLength: 12
    };

    expect(calloutComponentInputTextValidator(schema, "Hello world")).toBe(
      false
    );
  });

  test("'Hello world' should be invalid answer for maxLength 9 validation rule", () => {
    const schema: CalloutComponentInputTextAreaSchema = {
      ...calloutTextarea1Form
    };
    schema.validate = {
      maxLength: 9
    };

    expect(calloutComponentInputTextValidator(schema, "Hello world")).toBe(
      false
    );
  });

  test("'Hello world' should be invalid answer for minWords 3 validation rule", () => {
    const schema: CalloutComponentInputTextAreaSchema = {
      ...calloutTextarea1Form
    };
    schema.validate = {
      minWords: 3
    };

    expect(calloutComponentInputTextValidator(schema, "Hello world")).toBe(
      false
    );
  });

  test("'Hello world' should be invalid answer for maxWords 1 validation rule", () => {
    const schema: CalloutComponentInputTextAreaSchema = {
      ...calloutTextarea1Form
    };
    schema.validate = {
      maxWords: 1
    };

    expect(calloutComponentInputTextValidator(schema, "Hello world")).toBe(
      false
    );
  });
});
