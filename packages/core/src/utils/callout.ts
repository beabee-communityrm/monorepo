import type {
  CalloutComponentSchema,
  CalloutResponseAnswersSlide,
  SetCalloutFormSchema,
} from '@beabee/beabee-common';
import { stringifyAnswer } from '@beabee/beabee-common';

/**
 * Formats callout response answers as simple HTML for email templates
 *
 * @param answers The response answers grouped by slide
 * @param formSchema The callout form schema containing components
 * @param componentText Optional translations for component labels
 * @returns HTML string with formatted answers
 */
export function formatCalloutResponseAnswersToHtml(
  answers: CalloutResponseAnswersSlide,
  formSchema: SetCalloutFormSchema,
  componentText?: Record<string, string>
): string {
  const htmlParts: string[] = [];

  // Iterate through slides
  for (const slide of formSchema.slides) {
    const slideAnswers = answers[slide.id];
    if (!slideAnswers) continue;

    // Iterate through components in the slide
    for (const component of slide.components) {
      // Skip non-input components and admin-only fields
      if (!component.input || component.adminOnly) continue;

      const answer = slideAnswers[component.key];
      if (!answer) continue; // Skip empty answers

      // Get the component label (use translation if available)
      const label =
        componentText?.[component.label || ''] ||
        component.label ||
        component.key;

      // Format the answer using existing utility
      const formattedAnswer = stringifyAnswer(component, answer);

      // Skip if answer is empty after formatting
      if (!formattedAnswer.trim()) continue;

      // Create simple HTML paragraph
      htmlParts.push(`<p><strong>${label}:</strong> ${formattedAnswer}</p>`);
    }
  }

  return htmlParts.join('');
}
