import { describe, expect, test } from "@jest/globals";
import {
  CalloutFormSchema,
  CalloutResponseAnswers,
  stringifyAnswer,
  flattenComponents,
  InputCalloutComponentSchema,
  RadioCalloutComponentSchema,
  SelectCalloutComponentSchema,
} from "../../src";

const textComponent: InputCalloutComponentSchema = {
  type: "textfield",
  key: "myTextComponent",
  label: "My text component",
  input: true,
};

const textComponent2: InputCalloutComponentSchema = {
  type: "textfield",
  key: "myTextComponent2",
  label: "My text component",
  input: true,
};

const radioComponent: RadioCalloutComponentSchema = {
  type: "radio",
  key: "myRadioComponent",
  label: "My radio component",
  input: true,
  values: [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
    { value: "opt3", label: "Option 3" },
  ],
};

const selectComponent: SelectCalloutComponentSchema = {
  type: "select",
  key: "mySelectComponent",
  label: "My select component",
  input: true,
  data: {
    values: [
      { value: "opt1", label: "Option 1" },
      { value: "opt2", label: "Option 2" },
      { value: "opt3", label: "Option 3" },
    ],
  },
};

const selectBoxComponent: RadioCalloutComponentSchema = {
  type: "selectboxes",
  key: "mySelectBoxComponent",
  label: "My select box component",
  input: true,
  values: [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
    { value: "opt3", label: "Option 3" },
  ],
};

const answers: CalloutResponseAnswers = {
  myTextComponent: "Some text",
  myTextComponent2: "Some other text",
  myRadioComponent: "opt1",
  mySelectComponent: "opt2",
  mySelectBoxComponent: {
    opt1: true,
    opt2: false,
    opt3: true,
  },
};

const formSchema: CalloutFormSchema = {
  components: [
    textComponent,
    textComponent2,
    radioComponent,
    selectComponent,
    selectBoxComponent,
  ],
};

describe("stringifyAnswers should show a nice answer for", () => {
  test("text components", () => {
    expect(stringifyAnswer(textComponent, answers.myTextComponent)).toBe(
      "Some text"
    );
  });

  test("radio components", () => {
    expect(stringifyAnswer(radioComponent, answers.myRadioComponent)).toBe(
      "Option 1"
    );
  });

  test("select box components", () => {
    expect(
      stringifyAnswer(selectBoxComponent, answers.mySelectBoxComponent)
    ).toBe("Option 1, Option 3");
  });

  test("select components", () => {
    expect(stringifyAnswer(selectComponent, answers.mySelectComponent)).toBe(
      "Option 2"
    );
  });
});

describe("flattenComponents should", () => {
  test("keep a flat form schema the same", () => {
    expect(flattenComponents(formSchema.components)).toEqual(
      formSchema.components
    );
  });
});
