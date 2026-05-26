/**
 * Callout helpers for server-side ingestion paths (CSV import, etc.).
 *
 * Frontend-relevant callout utilities live in `@beabee/beabee-common` — these
 * helpers exist here because they are only consumed by backend tooling today.
 */
import {
  CalloutComponentBaseType,
  CalloutComponentSchema,
  CalloutComponentType,
  isCalloutComponentOfBaseType,
  isCalloutComponentOfType,
} from '@beabee/beabee-common';

function normalizeLabel(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

/**
 * Given a label string (e.g. from a CSV import cell), return the internal
 * value of the matching option on a selectable/select component. Comparison is
 * done on normalized labels (trimmed, with internal whitespace collapsed) so
 * trailing-space artefacts in the form schema don't break matching.
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

  const byValue = options.find((v) => v.value === needle);
  if (byValue) return byValue.value;

  return needle;
}

/**
 * Parse a free-form multi-value string (comma-separated labels from a CSV cell)
 * into a selectboxes answer shape (`{ [value]: true }`).
 *
 * Uses greedy longest-label-first matching against the component's option
 * labels, which correctly handles labels that themselves contain commas —
 * e.g. `"Ja, mehrmals"` or `"Soziale Medien (Facebook, YouTube, Instagram,
 * X/Twitter usw.)"`. Also accepts internal values for pre-converted CSVs.
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
    for (const fragment of remaining.split(',').map((s) => s.trim())) {
      if (fragment) result[fragment] = true;
    }
    return result;
  }

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
