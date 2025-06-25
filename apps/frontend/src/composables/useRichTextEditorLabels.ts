import type { RichTextEditorLabels } from '@beabee/vue';

import { useI18n } from 'vue-i18n';

/**
 * Composable that provides standard labels for the RichTextEditor component
 * using the current i18n translations.
 *
 * @returns RichTextEditorLabels object with translated labels
 */
export function useRichTextEditorLabels(): RichTextEditorLabels {
  const { t } = useI18n();

  return {
    bold: t('form.richtext.bold'),
    italic: t('form.richtext.italic'),
    underline: t('form.richtext.underline'),
    strikethrough: t('form.richtext.strikethrough'),
    heading: t('form.richtext.heading'),
    bulletList: t('form.richtext.bulletlist'),
    numberedList: t('form.richtext.numberedlist'),
    link: t('form.richtext.link'),
  };
}
