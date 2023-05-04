import {
  CalloutComponentSchema,
  CalloutResponseAnswer,
} from "../data/callouts";
import { FilterArgs } from "../search";

export function flattenComponents(
  components: CalloutComponentSchema[]
): CalloutComponentSchema[] {
  return components.flatMap((component) => [
    component,
    ...flattenComponents(component.components || []),
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

export function stringifyAnswer(
  component: CalloutComponentSchema,
  answer: CalloutResponseAnswer
): string {
  if (!answer) {
    return "";
  } else if (typeof answer === "object") {
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
