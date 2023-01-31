import { CalloutComponentSchema } from "../data/callouts";
import { FilterArgs, Filters } from "../search";

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
): FilterArgs {
  const baseItem = {
    // label: component.label || component.key,
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

    default:
      return { ...baseItem, type: "text" };
  }
}

export function convertComponentsToFilters(
  components: CalloutComponentSchema[]
): Filters {
  const items = components.map((c) => {
    return [`answers.${c.key}`, convertComponentToFilter(c)] as const;
  });

  return Object.fromEntries(items);
}
