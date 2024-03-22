import { assertEquals } from "https://deno.land/std@0.212.0/assert/assert_equals.ts";
import {
  CalloutComponentBaseNestableSchema,
  CalloutComponentInputSelectableRadioSchema,
  CalloutComponentInputSelectableSchema,
  CalloutComponentInputSelectSchema,
  CalloutComponentInputTextFieldSchema,
  CalloutComponentType,
  CalloutResponseAnswersSlide,
  getCalloutComponents,
  GetCalloutFormSchema,
  stringifyAnswer,
} from "../../mod.ts";

const textComponent: CalloutComponentInputTextFieldSchema = {
  id: "myTextComponent",
  type: CalloutComponentType.INPUT_TEXT_FIELD,
  key: "myTextComponent",
  label: "My text component",
  input: true,
};

const textComponent2: CalloutComponentInputTextFieldSchema = {
  id: "myTextComponent2",
  type: CalloutComponentType.INPUT_TEXT_FIELD,
  key: "myTextComponent2",
  label: "My text component",
  input: true,
};

const radioComponent: CalloutComponentInputSelectableRadioSchema = {
  id: "myRadioComponent",
  type: CalloutComponentType.INPUT_SELECTABLE_RADIO,
  key: "myRadioComponent",
  label: "My radio component",
  input: true,
  values: [
    { value: "opt1", label: "Option 1", nextSlideId: "" },
    { value: "opt2", label: "Option 2", nextSlideId: "" },
    { value: "opt3", label: "Option 3", nextSlideId: "" },
  ],
};

const selectComponent: CalloutComponentInputSelectSchema = {
  id: "mySelectComponent",
  type: CalloutComponentType.INPUT_SELECT,
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

const selectBoxComponent: CalloutComponentInputSelectableSchema = {
  id: "mySelectBoxComponent",
  type: CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES,
  key: "mySelectBoxComponent",
  label: "My select box component",
  input: true,
  values: [
    { value: "opt1", label: "Option 1", nextSlideId: "" },
    { value: "opt2", label: "Option 2", nextSlideId: "" },
    { value: "opt3", label: "Option 3", nextSlideId: "" },
  ],
};

// TODO: Add tests for nested components
const panelComponent: CalloutComponentBaseNestableSchema = {
  id: "myPanelComponent",
  type: CalloutComponentType.NESTABLE_PANEL,
  key: "myPanelComponent",
  label: "My panel component",
  input: false,
  components: [textComponent, textComponent2],
};

const answers: CalloutResponseAnswersSlide = {
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

const formSchema: GetCalloutFormSchema = {
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
  componentText: {},
};

Deno.test("stringifyAnswers should show a nice answer for", async (t) => {
  await t.step("text components", () => {
    assertEquals(
      stringifyAnswer(textComponent, answers.slide1?.myTextComponent),
      "Some text",
    );
  });

  await t.step("radio components", () => {
    assertEquals(
      stringifyAnswer(radioComponent, answers.slide1?.myRadioComponent),
      "Option 1",
    );
  });

  await t.step("select box components", () => {
    assertEquals(
      stringifyAnswer(selectBoxComponent, answers.slide1?.mySelectBoxComponent),
      "Option 1, Option 3",
    );
  });

  await t.step("select components", () => {
    assertEquals(
      stringifyAnswer(selectComponent, answers.slide1?.mySelectComponent),
      "Option 2",
    );
  });
});

Deno.test("getCalloutFilters should", async (t) => {
  await t.step("keep a flat form schema the same", () => {
    assertEquals(
      getCalloutComponents(formSchema),
      formSchema.slides[0].components.map((c) => ({
        ...c,
        slideId: "slide1",
        fullKey: `slide1.${c.key}`,
      })),
    );
  });
});
