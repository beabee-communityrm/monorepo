import {
  calloutComponentInputSelectableTypes,
  calloutComponentInputTextTypes,
  calloutComponentInputTypes,
  calloutComponentNestableTypes,
  CalloutComponentType,
} from "../data/index.ts";
import { CalloutComponentInputTextAreaSchema } from "../types/callout-component-input-text-area-schema.ts";
import { CalloutComponentInputTextFieldSchema } from "../types/callout-component-input-text-field-schema.ts";
import type {
  CalloutComponentBaseSchema,
  CalloutComponentContentSchema,
  CalloutComponentInputAddressSchema,
  CalloutComponentInputCheckboxSchema,
  CalloutComponentInputCurrencySchema,
  CalloutComponentInputDateTimeSchema,
  CalloutComponentInputEmailSchema,
  CalloutComponentInputFileSchema,
  CalloutComponentInputNumberSchema,
  CalloutComponentInputPhoneNumberSchema,
  CalloutComponentInputSchema,
  CalloutComponentInputSelectableRadioSchema,
  CalloutComponentInputSelectableSchema,
  CalloutComponentInputSelectableSelectboxesSchema,
  CalloutComponentInputSelectSchema,
  CalloutComponentInputSignatureSchema,
  CalloutComponentInputTextSchema,
  CalloutComponentInputTimeSchema,
  CalloutComponentInputUrlSchema,
  CalloutComponentNestableSchema,
  CalloutComponentSchema,
  CalloutFormSchema,
  CalloutResponseAnswer,
  CalloutResponseAnswerAddress,
  CalloutResponseAnswerFileUpload,
  FilterArgs,
} from "../types/index.ts";

function convertValuesToOptions(
  values: { value: string; label: string }[],
): string[] {
  return values.map(({ value }) => value);
}

function convertComponentToFilter(
  component: CalloutComponentSchema & { fullKey: string },
): FilterArgs & { label: string } {
  const baseItem = {
    label: component.label || component.fullKey,
    nullable: true,
  };

  if (
    isCalloutInputCheckboxComponent(component)
  ) {
    return { ...baseItem, type: "boolean", nullable: false };
  }

  if (isCalloutInputNumberComponent(component)) {
    return { ...baseItem, type: "number" };
  }

  if (
    isCalloutInputSelectComponent(
      component,
    )
  ) {
    return {
      ...baseItem,
      type: "enum",
      options: convertValuesToOptions(component.data.values),
    };
  }

  if (
    isCalloutInputTextAreaComponent(component) && component.type === "textarea"
  ) {
    return { ...baseItem, type: "blob" };
  }

  return { ...baseItem, type: "text" };
}

function getNiceAnswer(
  component: CalloutComponentSchema,
  value: string,
): string {
  if (isCalloutInputSelectableComponent(component)) {
    return component.values.find((v) => v.value === value)?.label || value;
  }

  if (isCalloutInputSelectComponent(component)) {
    return (
      component.data.values.find((v) => v.value === value)?.label || value
    );
  }

  return value;
}

export function isCalloutComponentOfType<T extends CalloutComponentBaseSchema>(
  component: CalloutComponentBaseSchema,
  type: CalloutComponentType,
): component is T {
  return "type" in component &&
    component.type === type;
}

/**
 * Check if a component is a address component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputAddressComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputAddressSchema {
  return isCalloutComponentOfType<CalloutComponentInputAddressSchema>(
    component,
    CalloutComponentType.INPUT_ADDRESS,
  );
}

/**
 * Check if a component is a checkbox component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputCheckboxComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputCheckboxSchema {
  return isCalloutComponentOfType<CalloutComponentInputCheckboxSchema>(
    component,
    CalloutComponentType.INPUT_CHECKBOX,
  );
}

/**
 * Check if a component is a content component.
 *
 * @param component
 * @returns
 */
export function isCalloutContentComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentContentSchema {
  return isCalloutComponentOfType<CalloutComponentContentSchema>(
    component,
    CalloutComponentType.CONTENT,
  );
}

/**
 * Check if a component is a currency component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputCurrencyComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputCurrencySchema {
  return isCalloutComponentOfType<CalloutComponentInputCurrencySchema>(
    component,
    CalloutComponentType.INPUT_CURRENCY,
  );
}

/**
 * Check if a component is a date time component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputDateTimeComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputDateTimeSchema {
  return isCalloutComponentOfType<CalloutComponentInputDateTimeSchema>(
    component,
    CalloutComponentType.INPUT_DATE_TIME,
  );
}

/**
 * Check if a component is a email component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputEmailComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputEmailSchema {
  return isCalloutComponentOfType<CalloutComponentInputEmailSchema>(
    component,
    CalloutComponentType.INPUT_EMAIL,
  );
}

/**
 * Check if a component is a file component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputFileComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputFileSchema {
  return isCalloutComponentOfType<CalloutComponentInputFileSchema>(
    component,
    CalloutComponentType.INPUT_FILE,
  );
}

/**
 * Check if a component is a nestable component.
 * @param component
 * @returns
 */
export function isCalloutNestableComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentNestableSchema {
  // Addresses have embedded components we don't want to include
  return "components" in component && component.type !== "address" &&
    (calloutComponentNestableTypes as string[]).includes(
      component.type,
    );
}

/**
 * Check if a component is a input component.
 * @param component
 * @returns
 */
export function isCalloutInputComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputSchema {
  // Addresses have embedded components we don't want to include
  return "type" in component &&
    (calloutComponentInputTypes as string[]).includes(
      component.type,
    );
}

/**
 * Check if a component is a number component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputNumberComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputNumberSchema {
  return isCalloutComponentOfType(component, CalloutComponentType.INPUT_NUMBER);
}

/**
 * Check if a component is a phone number component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputPhoneNumberComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputPhoneNumberSchema {
  return isCalloutComponentOfType(
    component,
    CalloutComponentType.INPUT_PHONE_NUMBER,
  );
}

/**
 * Check if a component is a radio component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputSelectableRadioComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputSelectableRadioSchema {
  return isCalloutComponentOfType(
    component,
    CalloutComponentType.INPUT_SELECTABLE_RADIO,
  );
}

/**
 * Check if a component is a radio component.
 *
 * @param component
 * @returns
 */
export function isCalloutComponentInputSelectableSelectboxesComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputSelectableSelectboxesSchema {
  return isCalloutComponentOfType(
    component,
    CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES,
  );
}

/**
 * Check if a component is a input selectable component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputSelectableComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputSelectableSchema {
  return "type" in component &&
    (calloutComponentInputSelectableTypes as string[]).includes(
      component.type,
    );
}

/**
 * Check if a component is a select component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputSelectComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputSelectSchema {
  return isCalloutComponentOfType(
    component,
    CalloutComponentType.INPUT_SELECT,
  );
}

/**
 * Check if a component is a signature component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputSignatureComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputSignatureSchema {
  return isCalloutComponentOfType<CalloutComponentInputSignatureSchema>(
    component,
    CalloutComponentType.INPUT_SIGNATURE,
  );
}

/**
 * Check if a component is a text area component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputTextAreaComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputTextAreaSchema {
  return isCalloutComponentOfType<CalloutComponentInputTextAreaSchema>(
    component,
    CalloutComponentType.INPUT_TEXT_AREA,
  );
}

/**
 * Check if a component is a text area component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputTextFieldComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputTextFieldSchema {
  return isCalloutComponentOfType<CalloutComponentInputTextFieldSchema>(
    component,
    CalloutComponentType.INPUT_TEXT_FIELD,
  );
}

/**
 * Check if a component is any text component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputTextComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputTextSchema {
  return "type" in component &&
    (calloutComponentInputTextTypes as string[]).includes(
      component.type,
    );
}

/**
 * Check if a component is a time component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputTimeComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputTimeSchema {
  return isCalloutComponentOfType(component, CalloutComponentType.INPUT_TIME);
}

/**
 * Check if a component is a URL component.
 *
 * @param component
 * @returns
 */
export function isCalloutInputUrlComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputUrlSchema {
  return isCalloutComponentOfType(component, CalloutComponentType.INPUT_URL);
}

export function flattenComponents(
  components: CalloutComponentSchema[],
): CalloutComponentSchema[] {
  return components.flatMap((component) =>
    isCalloutNestableComponent(component)
      ? [component, ...flattenComponents(component.components)]
      : [component]
  );
}

export function filterComponents(
  components: CalloutComponentSchema[],
  filterFn: (component: CalloutComponentSchema) => boolean,
): CalloutComponentSchema[] {
  return components.filter(filterFn).map((component) => {
    return {
      ...component,
      ...(isCalloutNestableComponent(component) && {
        components: filterComponents(component.components, filterFn),
      }),
    };
  });
}

export function getCalloutComponents(
  formSchema: CalloutFormSchema,
): (CalloutComponentSchema & { slideId: string; fullKey: string })[] {
  return formSchema.slides.flatMap((slide) =>
    flattenComponents(slide.components).map((component) => ({
      ...component,
      slideId: slide.id,
      fullKey: `${slide.id}.${component.key}`,
    }))
  );
}

export function getCalloutFilters(
  formSchema: CalloutFormSchema,
): Record<string, FilterArgs & { label: string }> {
  const items = getCalloutComponents(formSchema)
    .filter((c) => c.input)
    .map((c) => [`answers.${c.fullKey}`, convertComponentToFilter(c)]);

  return Object.fromEntries(items);
}

export function isAddressAnswer(
  answer: CalloutResponseAnswer,
): answer is CalloutResponseAnswerAddress {
  return !!answer && typeof answer === "object" && "geometry" in answer;
}

export function isFileUploadAnswer(
  answer: CalloutResponseAnswer,
): answer is CalloutResponseAnswerFileUpload {
  return !!answer && typeof answer === "object" && "url" in answer;
}

export function stringifyAnswer(
  component: CalloutComponentSchema,
  answer: CalloutResponseAnswer | CalloutResponseAnswer[],
): string {
  if (Array.isArray(answer)) {
    return answer.map((a) => stringifyAnswer(component, a)).join(", ");
  } else if (!answer) {
    return "";
  } else if (isAddressAnswer(answer)) {
    return answer.geometry.location.lat + ", " + answer.geometry.location.lng;
  } else if (isFileUploadAnswer(answer)) {
    return answer.url;
  } else if (typeof answer === "object") {
    // Checkboxes
    return Object.entries(answer)
      .filter(([, selected]) => selected)
      .map(([value]) => getNiceAnswer(component, value))
      .join(", ");
  } else if (typeof answer === "string") {
    return getNiceAnswer(component, answer);
  } else {
    return answer.toString();
  }
}
