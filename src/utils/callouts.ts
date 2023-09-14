import {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  CalloutResponseAnswerAddress,
  CalloutResponseAnswerFileUpload,
} from "../data/callouts";
import { FilterArgs } from "../search";

export function filterComponents(
  components: CalloutComponentSchema[],
  filterFn: (component: CalloutComponentSchema) => boolean
): CalloutComponentSchema[] {
  return components.filter(filterFn).map((component) => {
    return {
      ...component,
      ...(component.components && {
        components: filterComponents(component.components, filterFn),
      }),
    };
  });
}

export function flattenComponents(
  components: CalloutComponentSchema[]
): CalloutComponentSchema[] {
  return components.flatMap((component) => [
    component,
    ...flattenComponents(
      // Addresses have embedded components we don't want in our component list
      (component.type !== "address" && component.components) || []
    ),
  ]);
}

function convertValuesToOptions(
  values: { value: string; label: string }[]
): string[] {
  return values.map(({ value, label }) => value);
}

function convertComponentToFilter(
  component: CalloutComponentSchema
): FilterArgs & { label: string } {
  const baseItem = {
    label: component.label || component.key,
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

export function convertComponentsToFilters(
  components: CalloutComponentSchema[]
): Record<string, FilterArgs & { label: string }> {
  const items = components.map((c) => {
    return [`answers.${c.key}`, convertComponentToFilter(c)] as const;
  });

  return Object.fromEntries(items);
}

function getNiceAnswer(
  component: CalloutComponentSchema,
  value: string
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

export function isAddressAnswer(
  answer: CalloutResponseAnswer
): answer is CalloutResponseAnswerAddress {
  return !!answer && typeof answer === "object" && "geometry" in answer;
}

export function isFileUploadAnswer(
  answer: CalloutResponseAnswer
): answer is CalloutResponseAnswerFileUpload {
  return !!answer && typeof answer === "object" && "url" in answer;
}

export function stringifyAnswer(
  component: CalloutComponentSchema,
  answer: CalloutResponseAnswer | CalloutResponseAnswer[]
): string {
  if (Array.isArray(answer)) {
    return answer.map((a) => stringifyAnswer(component, a)).join(", ");
  } else if (!answer) {
    return "";
  } else if (isAddressAnswer(answer)) {
    return answer.formatted_address;
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
