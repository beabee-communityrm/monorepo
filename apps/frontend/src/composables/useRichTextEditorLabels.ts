import { useI18n } from 'vue-i18n';

/**
 * Labels for the rich text editor toolbar buttons
 */
export interface RichTextEditorLabels {
  /** Bold button label */
  bold: string;
  /** Italic button label */
  italic: string;
  /** Underline button label */
  underline: string;
  /** Strikethrough button label */
  strikethrough: string;
  /** Heading button label */
  heading: string;
  /** Bullet list button label */
  bulletList: string;
  /** Numbered list button label */
  numberedList: string;
  /** Link button label */
  link: string;
}

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
