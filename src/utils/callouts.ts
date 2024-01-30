import { CalloutComponentType } from "../index.ts";
import {
  calloutComponentContentTypes,
  calloutComponentFileTypes,
  calloutComponentInputTypes,
  calloutComponentNestableTypes,
  calloutComponentRadioTypes,
  calloutComponentSelectTypes,
} from "../data/index.ts";
import type {
  CalloutComponentContentSchema,
  CalloutComponentFileSchema,
  CalloutComponentInputSchema,
  CalloutComponentNestableSchema,
  CalloutComponentRadioSchema,
  CalloutComponentSchema,
  CalloutComponentSelectSchema,
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

  switch (component.type) {
    case "checkbox":
      return { ...baseItem, type: "boolean", nullable: false };

    case "number":
      return { ...baseItem, type: "number" };

    case "select":
      return {
        ...baseItem,
        type: "enum",
        options: convertValuesToOptions(component.data.values),
      };

    case "selectboxes":
    case "radio":
      return {
        ...baseItem,
        type: component.type === "radio" ? "enum" : "array",
        options: convertValuesToOptions(component.values),
      };

    case "textarea":
      return { ...baseItem, type: "blob" };

    default:
      return { ...baseItem, type: "text" };
  }
}

function getNiceAnswer(
  component: CalloutComponentSchema,
  value: string,
): string {
  switch (component.type) {
    case "radio":
    case "selectboxes":
      return component.values.find((v) => v.value === value)?.label || value;
    case "select":
      return (
        component.data.values.find((v) => v.value === value)?.label || value
      );
    default:
      return value;
  }
}

export function isCalloutComponentOfType<T extends CalloutComponentSchema>(
  component: CalloutComponentSchema,
  type: CalloutComponentType,
): component is T {
  return "type" in component && component.type === type;
}

/**
 * Check if a component is a select component.
 *
 * @param component
 * @returns
 */
export function isSelectComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentSelectSchema {
  return "type" in component && component.type in calloutComponentSelectTypes;
}

/**
 * Check if a component is a radio component.
 *
 * @param component
 * @returns
 */
export function isRadioComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentRadioSchema {
  return "type" in component && component.type in calloutComponentRadioTypes;
}

/**
 * Check if a component is a content component.
 *
 * @param component
 * @returns
 */
export function isContentComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentContentSchema {
  return "type" in component && component.type in calloutComponentContentTypes;
}

/**
 * Check if a component is a file component.
 *
 * @param component
 * @returns
 */
export function isFileComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentFileSchema {
  return "type" in component && component.type in calloutComponentFileTypes;
}

/**
 * Check if a component is a file component.
 *
 * @param component
 * @returns
 */
export function isInputComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentInputSchema {
  return "type" in component && component.type in calloutComponentInputTypes;
}

/**
 * Check if a component is a nestable component.
 * @param component
 * @returns
 */
export function isNestableComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentNestableSchema {
  // Addresses have embedded components we don't want to include
  return "components" in component && component.type !== "address" &&
    "type" in calloutComponentNestableTypes;
}

export function flattenComponents(
  components: CalloutComponentSchema[],
): CalloutComponentSchema[] {
  return components.flatMap((component) =>
    isNestableComponent(component)
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
      ...(isNestableComponent(component) && {
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
