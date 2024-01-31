import {
  CalloutComponentAddressType,
  CalloutComponentCheckboxType,
  CalloutComponentContentType,
  CalloutComponentCurrencyType,
  CalloutComponentDateTimeType,
  CalloutComponentEmailType,
  CalloutComponentFileType,
  CalloutComponentNestableType,
  CalloutComponentNumberType,
  CalloutComponentPhoneNumberType,
  CalloutComponentSignatureType,
  CalloutComponentTextType,
  CalloutComponentTimeType,
  CalloutComponentType,
  CalloutComponentUrlType,
} from "../index.ts";
import {
  calloutComponentAddressTypes,
  calloutComponentCheckboxTypes,
  calloutComponentContentTypes,
  calloutComponentCurrencyTypes,
  calloutComponentDateTimeTypes,
  calloutComponentEmailTypes,
  calloutComponentFileTypes,
  calloutComponentNestableTypes,
  calloutComponentNumberTypes,
  calloutComponentPhoneNumberTypes,
  calloutComponentRadioTypes,
  calloutComponentSelectTypes,
  calloutComponentSignatureTypes,
  calloutComponentTextTypes,
  calloutComponentTimeTypes,
  calloutComponentUrlTypes,
} from "../data/index.ts";
import type {
  CalloutComponentAddressSchema,
  CalloutComponentCheckboxSchema,
  CalloutComponentContentSchema,
  CalloutComponentCurrencySchema,
  CalloutComponentDateTimeSchema,
  CalloutComponentEmailSchema,
  CalloutComponentFileSchema,
  CalloutComponentNestableSchema,
  CalloutComponentNumberSchema,
  CalloutComponentPhoneNumberSchema,
  CalloutComponentRadioSchema,
  CalloutComponentRadioType,
  CalloutComponentSchema,
  CalloutComponentSelectSchema,
  CalloutComponentSelectType,
  CalloutComponentSignatureSchema,
  CalloutComponentTextSchema,
  CalloutComponentTimeSchema,
  CalloutComponentUrlSchema,
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

  if (isCheckboxComponent(component)) {
    return { ...baseItem, type: "boolean", nullable: false };
  }

  if (isNumberComponent(component)) {
    return { ...baseItem, type: "number" };
  }

  if (isSelectComponent(component)) {
    return {
      ...baseItem,
      type: "enum",
      options: convertValuesToOptions(component.data.values),
    };
  }

  if (isTextComponent(component) && component.type === "textarea") {
    return { ...baseItem, type: "blob" };
  }

  return { ...baseItem, type: "text" };
}

function getNiceAnswer(
  component: CalloutComponentSchema,
  value: string,
): string {
  if (isRadioComponent(component)) {
    return component.values.find((v) => v.value === value)?.label || value;
  }

  if (isSelectComponent(component)) {
    return (
      component.data.values.find((v) => v.value === value)?.label || value
    );
  }

  return value;
}

export function isCalloutComponentOfType<T extends CalloutComponentSchema>(
  component: CalloutComponentSchema,
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
export function isAddressComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentAddressSchema {
  return "type" in component &&
    calloutComponentAddressTypes.includes(
      component.type as CalloutComponentAddressType,
    );
}

/**
 * Check if a component is a checkbox component.
 *
 * @param component
 * @returns
 */
export function isCheckboxComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentCheckboxSchema {
  return "type" in component &&
    calloutComponentCheckboxTypes.includes(
      component.type as CalloutComponentCheckboxType,
    );
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
  return "type" in component &&
    calloutComponentContentTypes.includes(
      component.type as CalloutComponentContentType,
    );
}

/**
 * Check if a component is a currency component.
 *
 * @param component
 * @returns
 */
export function isCurrencyComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentCurrencySchema {
  return "type" in component &&
    calloutComponentCurrencyTypes.includes(
      component.type as CalloutComponentCurrencyType,
    );
}

/**
 * Check if a component is a date time component.
 *
 * @param component
 * @returns
 */
export function isDateTimeComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentDateTimeSchema {
  return "type" in component &&
    calloutComponentDateTimeTypes.includes(
      component.type as CalloutComponentDateTimeType,
    );
}

/**
 * Check if a component is a email component.
 *
 * @param component
 * @returns
 */
export function isEmailComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentEmailSchema {
  return "type" in component &&
    calloutComponentEmailTypes.includes(
      component.type as CalloutComponentEmailType,
    );
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
  return "type" in component &&
    calloutComponentFileTypes.includes(
      component.type as CalloutComponentFileType,
    );
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
    calloutComponentNestableTypes.includes(
      component.type as CalloutComponentNestableType,
    );
}

/**
 * Check if a component is a number component.
 *
 * @param component
 * @returns
 */
export function isNumberComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentNumberSchema {
  return "type" in component &&
    calloutComponentNumberTypes.includes(
      component.type as CalloutComponentNumberType,
    );
}

/**
 * Check if a component is a phone number component.
 *
 * @param component
 * @returns
 */
export function isPhoneNumberComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentPhoneNumberSchema {
  return "type" in component &&
    calloutComponentPhoneNumberTypes.includes(
      component.type as CalloutComponentPhoneNumberType,
    );
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
  return "type" in component &&
    calloutComponentRadioTypes.includes(
      component.type as CalloutComponentRadioType,
    );
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
  return "type" in component &&
    calloutComponentSelectTypes.includes(
      component.type as CalloutComponentSelectType,
    );
}

/**
 * Check if a component is a signature component.
 *
 * @param component
 * @returns
 */
export function isSignatureComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentSignatureSchema {
  return "type" in component &&
    calloutComponentSignatureTypes.includes(
      component.type as CalloutComponentSignatureType,
    );
}

/**
 * Check if a component is a text component.
 *
 * @param component
 * @returns
 */
export function isTextComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentTextSchema {
  return "type" in component &&
    calloutComponentTextTypes.includes(
      component.type as CalloutComponentTextType,
    );
}

/**
 * Check if a component is a time component.
 *
 * @param component
 * @returns
 */
export function isTimeComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentTimeSchema {
  return "type" in component &&
    calloutComponentTimeTypes.includes(
      component.type as CalloutComponentTimeType,
    );
}

/**
 * Check if a component is a URL component.
 *
 * @param component
 * @returns
 */
export function isUrlComponent(
  component: CalloutComponentSchema,
): component is CalloutComponentUrlSchema {
  return "type" in component &&
    calloutComponentUrlTypes.includes(
      component.type as CalloutComponentUrlType,
    );
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
