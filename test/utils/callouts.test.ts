import { describe, expect, test } from "@jest/globals";
import {
  CalloutFormSchema,
  CalloutResponseAnswers,
  stringifyAnswer,
  InputCalloutComponentSchema,
  RadioCalloutComponentSchema,
  SelectCalloutComponentSchema,
  NestableCalloutComponentSchema,
  getCalloutComponents,
} from "../../src";

const textComponent: InputCalloutComponentSchema = {
  id: "myTextComponent",
  type: "textfield",
  key: "myTextComponent",
  label: "My text component",
  input: true,
};

const textComponent2: InputCalloutComponentSchema = {
  id: "myTextComponent2",
  type: "textfield",
  key: "myTextComponent2",
  label: "My text component",
  input: true,
};

const radioComponent: RadioCalloutComponentSchema = {
  id: "myRadioComponent",
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
  id: "mySelectComponent",
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
  id: "mySelectBoxComponent",
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

const panelComponent: NestableCalloutComponentSchema = {
  id: "myPanelComponent",
  type: "panel",
  key: "myPanelComponent",
  label: "My panel component",
  input: false,
  components: [textComponent, textComponent2],
};

const answers: CalloutResponseAnswers = {
  slide1: {
    myTextComponent: "Some text",
    myTextComponent2: "Some other text",
    myRadioComponent: "opt1",
    mySelectComponent: "opt2",
    mySelectBoxComponent: {
      opt1: true,
      opt2: false,
      opt3: true,
    },
  },
};

const formSchema: CalloutFormSchema = {
  slides: [
    {
      id: "slide1",
      title: "Slide 1",
      components: [
        textComponent,
        textComponent2,
        radioComponent,
        selectComponent,
        selectBoxComponent,
      ],
      navigation: {
        nextText: "Next",
        prevText: "Previous",
        submitText: "Submit",
        nextSlideId: "",
      },
    },
  ],
};

describe("stringifyAnswers should show a nice answer for", () => {
  test("text components", () => {
    expect(
      stringifyAnswer(textComponent, answers.slide1?.myTextComponent)
    ).toBe("Some text");
  });

  test("radio components", () => {
    expect(
      stringifyAnswer(radioComponent, answers.slide1?.myRadioComponent)
    ).toBe("Option 1");
  });

  test("select box components", () => {
    expect(
      stringifyAnswer(selectBoxComponent, answers.slide1?.mySelectBoxComponent)
    ).toBe("Option 1, Option 3");
  });

  test("select components", () => {
    expect(
      stringifyAnswer(selectComponent, answers.slide1?.mySelectComponent)
    ).toBe("Option 2");
  });
});

describe("getCalloutFilters should", () => {
  test("keep a flat form schema the same", () => {
    expect(getCalloutComponents(formSchema)).toEqual(
      formSchema.slides[0].components.map((c) => ({
        ...c,
        slideId: "slide1",
        fullKey: `slide1.${c.key}`,
      }))
    );
  });
});
