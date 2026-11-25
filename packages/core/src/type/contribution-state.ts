export type ContributionSubscriptionState =
  /** Any state that needs no change on our side */
  | { status: 'active' }
  | { status: 'cancelled'; cancelledAt: Date }
  /** Never started, so the contact should lose their membership */
  | { status: 'expired' }
  | { status: 'missing' };

export type ContributionMandateState = 'attached' | 'detached' | 'missing';

export type ContributionCustomerState = 'active' | 'deleted' | 'missing';

/** The fetched states of a contribution's subscription, mandate and customer */
export interface ContributionState {
  subscription?: ContributionSubscriptionState;
  mandate?: ContributionMandateState;
  customer?: ContributionCustomerState;
}

/** A contribution's state, or why it could not be fetched */
export type ContributionStateResult =
  | { state: ContributionState }
  | { error: unknown };
