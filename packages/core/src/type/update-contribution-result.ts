import { UpdateContributionForm } from './update-contribution-form';

export interface UpdateContributionResult {
  startNow: boolean;
  expiryDate: Date;
  form: UpdateContributionForm;
}
