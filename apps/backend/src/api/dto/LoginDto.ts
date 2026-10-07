import {
  LOGIN_ACTIONS,
  LoginAction,
  LogoutResultData,
} from '@beabee/beabee-common';
import { LoginData } from '@beabee/core/type';

import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

import IsNextUrl from '#api/validators/IsNextUrl';
import IsUrl from '#api/validators/IsUrl';

export class LoginDto implements LoginData {
  @IsEmail()
  email!: string;

  // We deliberately don't validate with IsPassword here so
  // invalid passwords return a 401
  @IsString()
  password!: string;

  /** Optional multi factor authentication token */
  @IsString()
  @IsOptional()
  token?: string;
}

export class LogoutResultDto implements LogoutResultData {
  @IsUrl()
  redirectUrl!: string;
}

export class OidcLoginOptsDto {
  /** Internal path to continue to after login */
  @IsOptional()
  @IsNextUrl()
  next?: string;

  /** What a logged-in member does at the identity provider inside this login */
  @IsOptional()
  @IsIn(LOGIN_ACTIONS)
  action?: LoginAction;
}
