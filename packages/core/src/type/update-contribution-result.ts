import type { UpdateContributionForm } from './update-contribution-form.js';

export interface UpdateContributionResult {
  startNow: boolean;
  expiryDate: Date;
  form: UpdateContributionForm;
}
