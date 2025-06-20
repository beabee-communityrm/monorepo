import type { AppStepperStep } from '@beabee/vue';

export interface SetMfaSteps {
  qrCode: AppStepperStep;
  enterCode: AppStepperStep;
  result: AppStepperStep;
}
