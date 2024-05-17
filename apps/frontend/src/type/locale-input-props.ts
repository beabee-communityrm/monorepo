import type { LocaleProp } from '.';

export interface LocaleInputProps {
  modelValue: LocaleProp;
  locales: string[];
  label: string;
  readonlyDefault?: boolean;
}
