import { type CalloutResponseAnswersSlide } from '@beabee/beabee-common';

export interface FormChangeEvent {
  isValid: boolean;
  data: CalloutResponseAnswersSlide[string];
}
