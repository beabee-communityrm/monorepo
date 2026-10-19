// Kept out of callouts.ts so formio only loads on pages that use it
import {
  type CalloutComponentSchema,
  CalloutComponentType,
  type CalloutResponseAnswer,
  type CalloutResponseAnswersSlide,
  type GetCalloutFormSchema,
  filterComponents,
  getCalloutComponents,
  isAddressAnswer,
  isFileUploadAnswer,
  isFormioFileAnswer,
  stringifyAnswer,
} from '@beabee/beabee-common';

import { Utils } from 'formiojs';

import type { CalloutResponseAnswerRow } from '#type';

import { currentLocaleConfig, i18n } from '../lib/i18n';
import { getVisibleSlides } from './callouts';
import { resolveImageUrl } from './url';

const { t } = i18n.global;

/**
 * Leaves out the components a set of answers hid, by checking each one's
 * conditional against the answers on its slide, as the form did
 *
 * @param formSchema - The form the answers were submitted to
 * @param answers - The answers, by slide
 * @returns The form without the hidden components
 */
function filterHiddenComponents(
  formSchema: GetCalloutFormSchema,
  answers: CalloutResponseAnswersSlide
): GetCalloutFormSchema {
  return {
    ...formSchema,
    slides: formSchema.slides.map((slide) => {
      const data = answers[slide.id] ?? {};
      return {
        ...slide,
        components: filterComponents(slide.components, (component) =>
          Utils.checkCondition(component, data, data, null, null)
        ),
      };
    }),
  };
}

/**
 * An answer as something displayable
 *
 * `stringifyAnswer` is built for CSV export, so it renders an address as JSON,
 * a file as its URL and a signature as its data URI. None of those is
 * readable, so each is handled here first. Uploads are stored under a
 * generated id, so there is no filename to show.
 *
 * @param component - The component the answer belongs to
 * @param answer - The answer, if the question was answered
 * @returns The answer as text, a file URL, or an image source
 */
function displayAnswer(
  component: CalloutComponentSchema & { fullKey: string },
  answer: CalloutResponseAnswer | CalloutResponseAnswer[] | undefined
): {
  value: string | null;
  href?: string;
  images?: string[];
  imageAlt?: string;
} {
  const list =
    answer === undefined ? [] : Array.isArray(answer) ? answer : [answer];
  const single = list[0];

  switch (component.type) {
    // Only a picked address carries geometry. Leaving the field alone stores
    // the string "{}", which would otherwise render as itself
    case CalloutComponentType.INPUT_ADDRESS:
      return {
        value:
          single !== undefined && isAddressAnswer(single)
            ? single.formatted_address
            : null,
      };

    case CalloutComponentType.INPUT_FILE: {
      const files = list.filter(isFileUploadAnswer);
      if (!files.length) return { value: null };

      // Uploads are routed by type, so the path says what was actually stored.
      // `path` only arrived in 2025, so anything older links rather than
      // rendering inline
      if (files.every((f) => f.path?.startsWith('images/'))) {
        return {
          value: null,
          images: files.map((f) => resolveImageUrl(f.path, 600)),
        };
      }

      // Old uploads have neither a filename nor a path, so the link stands on
      // its own and has to come from the deprecated `url`
      const [file] = files;
      const name = isFormioFileAnswer(file)
        ? file.originalName || file.name
        : null;
      return {
        value: name || null,
        href: file.path ? resolveImageUrl(file.path) : file.url,
      };
    }

    // Nothing validates a signature server-side, so check it really is a data
    // URI before handing it to an img
    case CalloutComponentType.INPUT_SIGNATURE:
      return typeof single === 'string' && single
        ? { value: null, images: [single], imageAlt: t('callout.signed') }
        : { value: null };

    // An unchecked box reads the same as an absent one, and `stringifyAnswer`
    // would give "true" or nothing at all
    case CalloutComponentType.INPUT_CHECKBOX:
      return { value: single ? t('common.yes') : t('common.no') };

    // Nothing validates answers server-side — the validators in
    // beabee-common have no call sites — so only format an actual number.
    // Anything else falls through and is shown as-is rather than as NaN
    case CalloutComponentType.INPUT_CURRENCY:
      if (typeof single === 'number') {
        return {
          value: new Intl.NumberFormat(currentLocaleConfig.value.baseLocale, {
            style: 'currency',
            currency: component.currency,
          }).format(single),
        };
      }
      break;

    // `stringifyAnswer` only looks an option's label up when the answer is a
    // string, but an option whose value is "1" is stored as the number 1
    case CalloutComponentType.INPUT_SELECT:
    case CalloutComponentType.INPUT_SELECTABLE_RADIO:
      return {
        value:
          stringifyAnswer(
            component,
            typeof single === 'number' && !Array.isArray(answer)
              ? String(single)
              : answer
          ) || null,
      };
  }

  return { value: stringifyAnswer(component, answer) || null };
}

/**
 * Turns a response's answers into rows for display
 *
 * Admin-only components are left out: their answers are reviewer-facing, and
 * the responses endpoint returns them to the contributor along with the rest.
 * So is anything the contributor never saw: slides their answers skipped, and
 * questions a condition hid.
 *
 * @param formSchema - The form the response was submitted to
 * @param answers - The response's answers, by slide
 * @returns One row per question, in form order
 */
export function getResponseAnswerRows(
  formSchema: GetCalloutFormSchema,
  answers: CalloutResponseAnswersSlide
): CalloutResponseAnswerRow[] {
  const { componentText } = formSchema;
  const visibleSlideIds = new Set(
    getVisibleSlides(formSchema.slides, answers).map((s) => s.id)
  );

  return getCalloutComponents(filterHiddenComponents(formSchema, answers))
    .filter((c) => c.input && !c.adminOnly && visibleSlideIds.has(c.slideId))
    .map((c) => ({
      key: c.fullKey,
      label: (c.label && componentText[c.label]) || c.label || c.key,
      ...displayAnswer(c, answers[c.slideId]?.[c.key]),
    }));
}
