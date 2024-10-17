// This isn't very useful at the moment, but it makes the contract between provider
// and service explicit
export interface CancelContributionResult {
  mandateId: string | null;
  subscriptionId: null;
}
