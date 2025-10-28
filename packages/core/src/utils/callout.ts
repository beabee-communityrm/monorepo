import {
  type CalloutComponentInputSchema,
  CalloutComponentType,
  type CalloutResponseAnswersSlide,
  type SetCalloutFormSchema,
  isAbsoluteUrl,
  isFileUploadAnswer,
  isFormioFileAnswer,
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

      // Get the component label (use translation if available)
      const label =
        componentText?.[component.label || ''] ||
        component.label ||
        component.key;

      // Check if this is a signature component with base64 image data
      const isSignatureComponent =
        component.type === CalloutComponentType.INPUT_SIGNATURE;
      const isBase64Image =
        !Array.isArray(answer) &&
        typeof answer === 'string' &&
        answer.startsWith('data:image/');

      // Check if this is a URL component
      const isUrlComponent = component.type === CalloutComponentType.INPUT_URL;
      const isValidUrl =
        !Array.isArray(answer) &&
        typeof answer === 'string' &&
        isAbsoluteUrl(answer);

      // Check if this is a file upload component
      const isFileComponent =
        component.type === CalloutComponentType.INPUT_FILE;

      // Check if answer is a file upload (single or array)
      const isFileUpload = !Array.isArray(answer) && isFileUploadAnswer(answer);
      const isFormioFileUpload =
        !Array.isArray(answer) && isFormioFileAnswer(answer);
      const isFileUploadArray =
        Array.isArray(answer) &&
        answer.every(
          (item) => isFileUploadAnswer(item) || isFormioFileAnswer(item)
        );

      const isValidFileUrl = isFileUpload && isAbsoluteUrl(answer.url);
      const isValidFormioFileUrl =
        isFormioFileUpload && isAbsoluteUrl(answer.url);
      const isValidFileArrayUrls =
        isFileUploadArray && answer.every((item) => isAbsoluteUrl(item.url));

      let formattedAnswer: string;

      if (isSignatureComponent && isBase64Image) {
        // Render signature as an image element
        formattedAnswer = `<img src="${answer}" alt="${label}" style="max-width: 300px; height: auto; border: 1px solid #ccc;" />`;
      } else if (isUrlComponent && isValidUrl) {
        // Render URL as an external link
        formattedAnswer = `<a href="${answer}" target="_blank" rel="noopener noreferrer">${answer}</a>`;
      } else if (isFileComponent && isValidFileUrl) {
        // Render single file upload as an external link
        formattedAnswer = `<a href="${answer.url}" target="_blank" rel="noopener noreferrer">${answer.url}</a>`;
      } else if (isFileComponent && isValidFormioFileUrl) {
        // Render single formio file upload as an external link
        formattedAnswer = `<a href="${answer.url}" target="_blank" rel="noopener noreferrer">${answer.url}</a>`;
      } else if (isFileComponent && isValidFileArrayUrls) {
        // Render array of file uploads as multiple external links
        const links = answer
          .map(
            (item) =>
              `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.url}</a>`
          )
          .join('<br />');
        formattedAnswer = links;
      } else {
        // Format the answer using existing utility for other components
        formattedAnswer = stringifyAnswer(component, answer);
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

      // Get the component label (use translation if available)
      const label =
        componentText?.[component.label || ''] ||
        component.label ||
        component.key;

      // If real placeholders are desired, we could implement a method
      // `generateEmptyAnswerPlaceholder(component)` here
      const placeholder = '';

      // Create simple HTML paragraph
      htmlParts.push(`<p><strong>${label}:</strong> ${placeholder}</p>`);
    }
  }

  return htmlParts.join('');
}
