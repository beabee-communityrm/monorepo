import {
  CalloutComponentBaseType,
  calloutComponentInputSelectableTypes,
  calloutComponentInputTextTypes,
  calloutComponentInputTypes,
  calloutComponentNestableTypes,
  CalloutComponentType,
} from "../data/index.ts";

import type {
  CalloutComponentBaseMap,
  CalloutComponentBaseSchema,
  CalloutComponentMap,
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
    isCalloutComponentOfType(component, CalloutComponentType.INPUT_CHECKBOX)
  ) {
    return { ...baseItem, type: "boolean", nullable: false };
  }

  if (isCalloutComponentOfType(component, CalloutComponentType.INPUT_NUMBER)) {
    return { ...baseItem, type: "number" };
  }

  if (
    isCalloutComponentOfType(
      component,
      CalloutComponentType.INPUT_SELECT,
    )
  ) {
    return {
      ...baseItem,
      type: "enum",
      options: convertValuesToOptions(component.data.values),
    };
  }

  if (
    isCalloutComponentOfType(component, CalloutComponentType.INPUT_TEXT_AREA)
  ) {
    return { ...baseItem, type: "blob" };
  }

  return { ...baseItem, type: "text" };
}

function getSelectableLabelFromValue(
  component: CalloutComponentSchema,
  value: string,
): string {
  if (
    isCalloutComponentOfBaseType(
      component,
      CalloutComponentBaseType.INPUT_SELECTABLE,
    )
  ) {
    return component.values.find((v) => v.value === value)?.label || value;
  }

  if (isCalloutComponentOfType(component, CalloutComponentType.INPUT_SELECT)) {
    return (
      component.data.values.find((v) => v.value === value)?.label || value
    );
  }

  return value;
}

/**
 * Check if a component is a specific component type
 *
 * @param component The component to check
 * @param type The type of component to check
 * @returns Ensure that the component is of the specific type
 */
export function isCalloutComponentOfType<T extends CalloutComponentType>(
  component: CalloutComponentBaseSchema,
  type: T,
): component is CalloutComponentMap[T] {
  return "type" in component &&
    component.type === type;
}

/**
 * Check if a component is a specific base component type
 *
 * @param component The component to check
 * @param type The type of component to check
 * @returns Ensure that the component is of the specific base type
 */
export function isCalloutComponentOfBaseType<
  T extends CalloutComponentBaseType,
>(
  component: CalloutComponentBaseSchema,
  type: T,
): component is CalloutComponentBaseMap[T] {
  if (!("type" in component)) {
    return false;
  }

  // `content` has only one schema
  if (type === CalloutComponentBaseType.CONTENT) {
    return isCalloutComponentOfType(
      component,
      CalloutComponentType.CONTENT,
    );
  }

  if (type === CalloutComponentBaseType.INPUT) {
    return (calloutComponentInputTypes as string[]).includes(
      component.type,
    );
  }

  if (type === CalloutComponentBaseType.INPUT_TEXT) {
    return (calloutComponentInputTextTypes as string[]).includes(
      component.type,
    );
  }

  if (type === CalloutComponentBaseType.INPUT_SELECTABLE) {
    return (calloutComponentInputSelectableTypes as string[]).includes(
      component.type,
    );
  }

  if (type === CalloutComponentBaseType.NESTABLE) {
    return (calloutComponentNestableTypes as string[]).includes(
      component.type,
    );
  }

  return false;
}

export function flattenComponents(
  components: CalloutComponentSchema[],
): CalloutComponentSchema[] {
  return components.flatMap((component) =>
    isCalloutComponentOfBaseType(component, CalloutComponentBaseType.NESTABLE)
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
      ...(isCalloutComponentOfBaseType(
        component,
        CalloutComponentBaseType.NESTABLE,
      ) && {
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
  answer: CalloutResponseAnswer | undefined,
): answer is CalloutResponseAnswerFileUpload {
  return !!answer && typeof answer === "object" && "url" in answer;
}

export function stringifyAnswer(
  component: CalloutComponentSchema,
  answer: CalloutResponseAnswer | CalloutResponseAnswer[] | undefined,
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
      .map(([value]) => getSelectableLabelFromValue(component, value))
      .join(", ");
  } else if (typeof answer === "string") {
    return getSelectableLabelFromValue(component, answer);
  } else {
    return answer.toString();
  }
}
