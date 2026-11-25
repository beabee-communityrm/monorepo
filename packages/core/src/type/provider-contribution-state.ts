export type ProviderSubscriptionState =
  /** Any state that needs no change on our side */
  | { status: 'active' }
  | { status: 'cancelled'; cancelledAt: Date }
  /** Never started, so the contact should lose their membership */
  | { status: 'expired' }
  | { status: 'missing' };

export type ProviderMandateState = 'attached' | 'detached' | 'missing';

export type ProviderCustomerState = 'active' | 'deleted' | 'missing';

/** The fetched states of a contribution's subscription, mandate and customer */
export interface ProviderContributionState {
  subscription?: ProviderSubscriptionState;
  mandate?: ProviderMandateState;
  customer?: ProviderCustomerState;
}

/** A contribution's state, or why it could not be fetched */
export type ProviderContributionResult =
  | { state: ProviderContributionState }
  | { error: unknown };
