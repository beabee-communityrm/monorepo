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

function normalizeLabel(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

/**
 * Inverse of {@link getSelectableLabelFromValue}: given a label (e.g. from a
 * CSV import cell), return the internal value of the matching option on a
 * selectable/select component. Comparison is done on normalized labels
 * (trimmed, with internal whitespace collapsed) so trailing-space artefacts in
 * the form schema don't break matching.
 *
 * Accepts pre-converted inputs: if the input already matches an existing
 * internal `value`, it is returned unchanged.
 *
 * Falls back to the trimmed input when no match is found or when the component
 * isn't a selectable/select type.
 */
export function getSelectableValueFromLabel(
  component: CalloutComponentSchema,
  label: string
): string {
  const needle = normalizeLabel(label);
  const options = isCalloutComponentOfBaseType(
    component,
    CalloutComponentBaseType.INPUT_SELECTABLE
  )
    ? component.values
    : isCalloutComponentOfType(component, CalloutComponentType.INPUT_SELECT)
      ? component.data.values
      : null;
  if (!options) return needle;

  const byLabel = options.find((v) => normalizeLabel(v.label) === needle);
  if (byLabel) return byLabel.value;

  // Already an internal value? Return as-is — lets the importer be tolerant
  // of pre-converted CSVs without emitting misleading warnings.
  const byValue = options.find((v) => v.value === needle);
  if (byValue) return byValue.value;

  return needle;
}

/**
 * Parse a free-form multi-value string (comma-separated labels from a CSV cell)
 * into a {@link CalloutResponseAnswer} shape (`{ [value]: true }`) for a
 * selectboxes component.
 *
 * Uses greedy longest-label-first matching against the component's option
 * labels, which correctly handles labels that themselves contain commas —
 * e.g. `"Ja, mehrmals"` or `"Soziale Medien (Facebook, YouTube, Instagram,
 * X/Twitter usw.)"`.
 *
 * Unknown fragments are preserved under their trimmed raw text as keys (so no
 * data is silently dropped) and reported once via `onWarn`.
 */
export function parseSelectableMultiValue(
  component: CalloutComponentSchema,
  value: string,
  onWarn?: (unknownLabel: string) => void
): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  let remaining = normalizeLabel(value);
  if (!remaining) return result;

  if (
    !isCalloutComponentOfBaseType(
      component,
      CalloutComponentBaseType.INPUT_SELECTABLE
    )
  ) {
    // Caller should only pass selectable components; fall back to raw split.
    for (const fragment of remaining.split(',').map((s) => s.trim())) {
      if (fragment) result[fragment] = true;
    }
    return result;
  }

  // Tokens we can match at the start of `remaining`, preferring longest first.
  // Includes both normalized LABELS (from Google-Forms-style CSVs) and internal
  // VALUES (from pre-converted CSVs), so the parser tolerates either format.
  const tokens = [
    ...component.values.map((v) => ({
      match: normalizeLabel(v.label),
      value: v.value,
    })),
    ...component.values.map((v) => ({ match: v.value, value: v.value })),
  ].sort((a, b) => b.match.length - a.match.length);

  while (remaining.length > 0) {
    remaining = remaining.replace(/^[,\s]+/, '');
    if (!remaining) break;

    const hit = tokens.find(({ match }) => remaining.startsWith(match));
    if (hit) {
      result[hit.value] = true;
      remaining = remaining.slice(hit.match.length);
      continue;
    }

    // No known token at the current position. Bound the unknown fragment by
    // finding the next position where a known token begins after a separator
    // (", " for Google-Forms-style, "," for pre-converted CSVs).
    let cut = remaining.length;
    for (const { match } of tokens) {
      for (const sep of [', ', ',']) {
        const idx = remaining.indexOf(sep + match);
        if (idx !== -1 && idx < cut) cut = idx;
      }
    }
    const fragment = remaining.slice(0, cut).trim();
    if (fragment) {
      onWarn?.(fragment);
      result[fragment] = true;
    }
    remaining = remaining.slice(cut);
  }

  return result;
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
    return answer.geometry.location.lat + ', ' + answer.geometry.location.lng;
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
