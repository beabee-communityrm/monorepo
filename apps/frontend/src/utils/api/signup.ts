import {
  ContributionPeriod,
  type Serial,
  type PaymentFlowParams,
  type CompleteSignupData,
  type SignupData,
} from '@beabee/beabee-common';
import env from '../../env';
import { instance } from '.';

export const completeUrl = env.appUrl + '/join/complete';

/** @deprecated use the client instead */
export async function signUp(data: SignupData): Promise<PaymentFlowParams> {
  return (
    await instance.post<Serial<PaymentFlowParams>>('/signup', {
      email: data.email,
      loginUrl: env.appUrl + '/auth/login',
      setPasswordUrl: env.appUrl + '/auth/set-password',
      confirmUrl: env.appUrl + '/join/confirm-email',
      ...(!data.noContribution && {
        contribution: {
          amount: data.amount,
          period: data.period,
          payFee: data.payFee && data.period === ContributionPeriod.Monthly,
          prorate: false,
          paymentMethod: data.paymentMethod,
          completeUrl,
        },
      }),
    })
  ).data;
}

/** @deprecated use the client instead */
export async function completeSignUp(data: CompleteSignupData): Promise<void> {
  await instance.post('/signup/complete', {
    paymentFlowId: data.paymentFlowId,
    firstname: data.firstname,
    lastname: data.lastname,
    vatNumber: data.vatNumber,
  });
}

/** @deprecated use the client instead */
export async function confirmEmail(
  joinFlowId: string | string[]
): Promise<void> {
  await instance.post('/signup/confirm-email', { joinFlowId });
}
