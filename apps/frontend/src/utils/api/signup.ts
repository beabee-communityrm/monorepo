import { ContributionPeriod } from '@beabee/beabee-common';
import env from '../../env';
import { instance } from '.';

import type {
  CompleteSignupData,
  PaymentFlowParams,
  Serial,
  SignupData,
} from '@type';

export const completeUrl = env.appUrl + '/join/complete';

export async function signUp(data: SignupData): Promise<PaymentFlowParams> {
  return (
    await instance.post<Serial<PaymentFlowParams>>('/signup', {
      email: data.email,
      password: data.password,
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

export async function completeSignUp(data: CompleteSignupData): Promise<void> {
  await instance.post('/signup/complete', {
    paymentFlowId: data.paymentFlowId,
    firstname: data.firstname,
    lastname: data.lastname,
    vatNumber: data.vatNumber,
  });
}

export async function confirmEmail(
  joinFlowId: string | string[]
): Promise<void> {
  await instance.post('/signup/confirm-email', { joinFlowId });
}
