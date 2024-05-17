import env from '@env';

import { instance } from '.';

import { RESET_SECURITY_FLOW_TYPE } from '@enums/reset-security-flow-type';

import type {
  CreateResetPasswordData,
  UpdateResetPasswordData,
  CreateResetDeviceData,
  UpdateResetDeviceData,
} from '@type';

/**
 * Starts the reset password flow.
 * This is mostly used if the user has clicked on the forgot password the link on the login page.
 * @param email The email of the user.
 */
export async function resetPasswordBegin(email: string): Promise<void> {
  const data: CreateResetPasswordData = {
    email,
    resetUrl: env.appUrl + '/auth/reset-password',
  };
  await instance.post('reset-password', data);
}

/**
 * Completes the reset password flow.
 * This is mostly used if the user has clicked the link in the email.
 * @param password The new password.
 * @param resetPasswordFlowId The id of the reset password flow.
 */
export async function resetPasswordComplete(
  resetPasswordFlowId: string,
  password: string,
  token?: string
): Promise<void> {
  const data: UpdateResetPasswordData = {
    password,
    token,
  };
  await instance.put(`reset-password/${resetPasswordFlowId}`, data);
}

/**
 * Starts the reset device flow.
 * This is mostly used if the user has clicked on the lost device the link on the login page.
 * @param email The email of the user.
 */
export async function resetDeviceBegin(email: string): Promise<void> {
  const data: CreateResetDeviceData = {
    email,
    resetUrl: env.appUrl + '/auth/reset-device',
    type: RESET_SECURITY_FLOW_TYPE.TOTP,
  };
  await instance.post('reset-device', data);
}

/**
 * Completes the reset device flow.
 * This is mostly used if the user has clicked the link in the email.
 * @param resetMfaFlowId The id of the reset device flow.
 * @param password The old password of the user for verification.
 */
export async function resetDeviceComplete(
  resetMfaFlowId: string,
  password: string
): Promise<void> {
  const data: UpdateResetDeviceData = {
    password,
    type: RESET_SECURITY_FLOW_TYPE.TOTP,
  };
  await instance.put(`reset-device/${resetMfaFlowId}`, data);
}
