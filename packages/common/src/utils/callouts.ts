import {
  CalloutComponentBaseType,
  CalloutComponentType,
  calloutComponentInputSelectableTypes,
  calloutComponentInputTextTypes,
  calloutComponentInputTypes,
  calloutComponentNestableTypes,
} from '../data/index.js';
import type {
  CalloutComponentBaseMap,
  CalloutComponentBaseSchema,
  CalloutComponentMap,
  CalloutComponentSchema,
  CalloutResponseAnswer,
  CalloutResponseAnswerAddress,
  CalloutResponseAnswerFileUpload,
  CalloutResponseAnswersSlide,
  FilterArgs,
  FormioFile,
  SetCalloutFormSchema,
} from '../types/index.js';

function convertValuesToOptions(
  values: { value: string; label: string }[]
): string[] {
  return values.map(({ value }) => value);
}

function convertComponentToFilter(
  component: CalloutComponentSchema & { fullKey: string }
): FilterArgs & { label: string } {
  const baseItem = {
    label: component.label || component.fullKey,
    nullable: true,
  };

  if (
    isCalloutComponentOfType(component, CalloutComponentType.INPUT_CHECKBOX)
  ) {
    return { ...baseItem, type: 'boolean', nullable: false };
  }

  if (isCalloutComponentOfType(component, CalloutComponentType.INPUT_NUMBER)) {
    return { ...baseItem, type: 'number' };
  }

  if (isCalloutComponentOfType(component, CalloutComponentType.INPUT_SELECT)) {
    return {
      ...baseItem,
      type: 'enum',
      options: convertValuesToOptions(component.data.values),
    };
  }

  if (
    isCalloutComponentOfBaseType(
      component,
      CalloutComponentBaseType.INPUT_SELECTABLE
    )
  ) {
    return {
      ...baseItem,
      type:
        component.type === CalloutComponentType.INPUT_SELECTABLE_RADIO
          ? 'enum'
          : 'array',
      options: convertValuesToOptions(component.values),
    };
  }

  if (
    isCalloutComponentOfType(component, CalloutComponentType.INPUT_TEXT_AREA)
  ) {
    return { ...baseItem, type: 'blob' };
  }

  return { ...baseItem, type: 'text' };
}

function getSelectableLabelFromValue(
  component: CalloutComponentSchema,
  value: string
): string {
  if (
    isCalloutComponentOfBaseType(
      component,
      CalloutComponentBaseType.INPUT_SELECTABLE
    )
  ) {
    return component.values.find((v) => v.value === value)?.label || value;
  }

  if (isCalloutComponentOfType(component, CalloutComponentType.INPUT_SELECT)) {
    return component.data.values.find((v) => v.value === value)?.label || value;
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
  type: T
): component is CalloutComponentMap[T] {
  return 'type' in component && component.type === type;
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
  type: T
): component is CalloutComponentBaseMap[T] {
  if (!('type' in component)) {
    return false;
  }

  // `content` has only one schema
  if (type === CalloutComponentBaseType.CONTENT) {
    return isCalloutComponentOfType(component, CalloutComponentType.CONTENT);
  }

  if (type === CalloutComponentBaseType.INPUT) {
    return (calloutComponentInputTypes as string[]).includes(component.type);
  }

  if (type === CalloutComponentBaseType.INPUT_TEXT) {
    return (calloutComponentInputTextTypes as string[]).includes(
      component.type
    );
  }

  if (type === CalloutComponentBaseType.INPUT_SELECTABLE) {
    return (calloutComponentInputSelectableTypes as string[]).includes(
      component.type
    );
  }

  if (type === CalloutComponentBaseType.NESTABLE) {
    return (calloutComponentNestableTypes as string[]).includes(component.type);
  }

  return false;
}

export function flattenComponents(
  components: CalloutComponentSchema[]
): CalloutComponentSchema[] {
  return components.flatMap((component) =>
    isCalloutComponentOfBaseType(component, CalloutComponentBaseType.NESTABLE)
      ? [component, ...flattenComponents(component.components)]
      : [component]
  );
}

export function filterComponents(
  components: CalloutComponentSchema[],
  filterFn: (component: CalloutComponentSchema) => boolean
): CalloutComponentSchema[] {
  return components.filter(filterFn).map((component) => {
    return {
      ...component,
      ...(isCalloutComponentOfBaseType(
        component,
        CalloutComponentBaseType.NESTABLE
      ) && {
        components: filterComponents(component.components, filterFn),
      }),
    };
  });
}

export function getCalloutComponents(
  formSchema: SetCalloutFormSchema
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
  formSchema: SetCalloutFormSchema
): Record<string, FilterArgs & { label: string }> {
  const items = getCalloutComponents(formSchema)
    .filter((c) => c.input)
    .map((c) => [`answers.${c.fullKey}`, convertComponentToFilter(c)]);

  return Object.fromEntries(items);
}

export function isAddressAnswer(
  answer: CalloutResponseAnswer
): answer is CalloutResponseAnswerAddress {
  return !!answer && typeof answer === 'object' && 'geometry' in answer;
}

export function isFileUploadAnswer(
  answer: CalloutResponseAnswer | undefined
): answer is CalloutResponseAnswerFileUpload {
  return !!answer && typeof answer === 'object' && 'url' in answer;
}

export function isFormioFileAnswer(
  answer: CalloutResponseAnswer | undefined
): answer is CalloutResponseAnswerFileUpload & FormioFile {
  return (
    !!answer &&
    typeof answer === 'object' &&
    'url' in answer &&
    'storage' in answer &&
    'name' in answer &&
    'size' in answer
    // Not defined on old files
    // "hash" in answer &&
    // "originalName" in answer
  );
}

export function stringifyAnswer(
  component: CalloutComponentSchema,
  answer: CalloutResponseAnswer | CalloutResponseAnswer[] | undefined
): string {
  if (Array.isArray(answer)) {
    return answer.map((a) => stringifyAnswer(component, a)).join(', ');
  } else if (!answer) {
    return '';
  } else if (isAddressAnswer(answer)) {
    return JSON.stringify(answer);
  } else if (isFileUploadAnswer(answer)) {
    return answer.url;
  } else if (typeof answer === 'object') {
    // Checkboxes
    return Object.entries(answer)
      .filter(([, selected]) => selected)
      .map(([value]) => getSelectableLabelFromValue(component, value))
      .join(', ');
  } else if (typeof answer === 'string') {
    return getSelectableLabelFromValue(component, answer);
  } else {
    return answer.toString();
  }
}

/**
 * Retrieves the value at a given path of a nested object, similar to lodash's `get` function.
 *
 * @param {object} obj - The object to query.
 * @param {string} path - The path of the property to get, using dot notation (e.g., "a.b.c").
 * @returns {unknown} - Returns the resolved value, or `undefined` if the path does not exist.
 *
 * @example
 * // Example with a generic object:
 * const data = { a: { b: { c: 42 } } };
 * const value = getByPath(data, 'a.b.c');
 * // value === 42
 *
 * // Example with a callout response object:
 * const calloutResponse = {
 *   answers: {
 *     'slide1.input1': 'some answer',
 *     'slide2.input2': 123
 *   }
 * };
 * const answer = getByPath(calloutResponse, 'answers.slide1.input1');
 * // answer === 'some answer'
 */
export function getByPath<T = unknown, R = unknown>(
  obj: T,
  path: string
): R | undefined {
  return path
    .split('.')
    .reduce<any>((acc, key) => (acc && key in acc ? acc[key] : undefined), obj);
}
