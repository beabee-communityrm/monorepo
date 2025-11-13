import {
  CalloutComponentType,
  type CalloutResponseAnswersSlide,
  type SetCalloutFormSchema,
  escapeHtml,
  isAbsoluteUrl,
  isFileUploadAnswer,
  isFormioFileAnswer,
  isURL,
  stringifyAnswer,
} from '@beabee/beabee-common';

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

      // Get the component label (use translation if available) and escape it
      const rawLabel =
        componentText?.[component.label || ''] ||
        component.label ||
        component.key;
      const label = escapeHtml(rawLabel);

      // Check component type and answer format
      const isSignatureComponent =
        component.type === CalloutComponentType.INPUT_SIGNATURE;
      const isBase64Image =
        !Array.isArray(answer) &&
        typeof answer === 'string' &&
        answer.startsWith('data:image/');

      const isUrlComponent = component.type === CalloutComponentType.INPUT_URL;
      const isValidUrl =
        !Array.isArray(answer) &&
        typeof answer === 'string' &&
        isAbsoluteUrl(answer);

      const isFileComponent =
        component.type === CalloutComponentType.INPUT_FILE;

      let formattedAnswer: string;

      if (isSignatureComponent && isBase64Image) {
        // Render signature as an image element (data URLs are safe)
        formattedAnswer = `<img src="${answer}" alt="${label}" style="max-width: 300px; height: auto; border: 1px solid #ccc;" />`;
      } else if (isUrlComponent && isValidUrl) {
        // Render URL as an external link (escape the URL for display)
        const escapedUrl = escapeHtml(answer);
        formattedAnswer = `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer">${escapedUrl}</a>`;
      } else if (
        isFileComponent &&
        !Array.isArray(answer) &&
        (isFileUploadAnswer(answer) || isFormioFileAnswer(answer)) &&
        isURL(answer.url)
      ) {
        // Render single file upload as an external link
        // Uses same validation logic as calloutComponentInputFileValidator
        const escapedUrl = escapeHtml(answer.url);
        formattedAnswer = `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer">${escapedUrl}</a>`;
      } else if (
        isFileComponent &&
        Array.isArray(answer) &&
        answer.every(
          (item) =>
            (isFileUploadAnswer(item) || isFormioFileAnswer(item)) &&
            isURL((item as { url: string }).url)
        )
      ) {
        // Render array of file uploads as multiple external links
        // Uses same validation logic as calloutComponentInputFileValidator
        const links = answer
          .map((item) => {
            const fileItem = item as { url: string };
            const escapedUrl = escapeHtml(fileItem.url);
            return `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer">${escapedUrl}</a>`;
          })
          .join('<br />');
        formattedAnswer = links;
      } else {
        // Format the answer using existing utility and escape result
        formattedAnswer = escapeHtml(stringifyAnswer(component, answer));
      }

      // Skip if answer is empty after formatting
      if (!formattedAnswer.trim()) continue;

      // Create simple HTML paragraph
      htmlParts.push(`<p><strong>${label}:</strong> ${formattedAnswer}</p>`);
    }
  }

  return htmlParts.join('');
}

/**
 * Formats callout questions with empty answers for email template preview
 * Shows all input components with placeholder answers to demonstrate email structure
 *
 * @param formSchema The callout form schema containing components
 * @param componentText Optional translations for component labels
 * @returns HTML string with formatted questions and empty answer placeholders
 */
export function formatCalloutResponseAnswersPreview(
  formSchema: SetCalloutFormSchema,
  componentText?: Record<string, string>
): string {
  const htmlParts: string[] = [];

  // Iterate through slides
  for (const slide of formSchema.slides) {
    // Iterate through components in the slide
    for (const component of slide.components) {
      // Skip non-input components and admin-only fields
      if (!component.input || component.adminOnly) continue;

      // Get the component label (use translation if available) and escape it
      const rawLabel =
        componentText?.[component.label || ''] ||
        component.label ||
        component.key;
      const label = escapeHtml(rawLabel);

      // Empty placeholder for preview
      const placeholder = '';

      // Create simple HTML paragraph
      htmlParts.push(`<p><strong>${label}:</strong> ${placeholder}</p>`);
    }
  }

  return htmlParts.join('');
}

/**
 * Format callout questions with empty answers for email template preview by slug
 * Convenience function for EmailService to format preview without loading the full callout
 *
 * @param calloutSlug The slug of the callout
 * @returns HTML string with formatted questions and empty answer placeholders
 */
export async function formatCalloutResponseAnswersPreviewBySlug(
  calloutSlug: string
): Promise<string> {
  const { getRepository } = await import('#database');
  const { NotFoundError } = await import('#errors/index');
  const { Callout } = await import('#models/index');

  // Load callout with variants
  const callout = await getRepository(Callout).findOne({
    where: { slug: calloutSlug },
    relations: { variants: true },
  });

  if (!callout || !callout.formSchema) {
    throw new NotFoundError();
  }

  // Get default variant for component text translations
  // TODO: To support multilingual callouts, we need to fetch the variant for the current locale
  const defaultVariant =
    callout.variants?.find((v) => v.name === 'default') ||
    callout.variants?.[0];

  if (!defaultVariant) {
    throw new NotFoundError({
      message: 'No default variant found for callout',
    });
  }

  // Format preview using the utility function
  return formatCalloutResponseAnswersPreview(
    callout.formSchema,
    defaultVariant.componentText
  );
}
