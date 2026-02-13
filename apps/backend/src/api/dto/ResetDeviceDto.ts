import { RESET_SECURITY_FLOW_TYPE } from '@beabee/beabee-common';

import IsPassword from '#api/validators/IsPassword';
import IsUrl from '#api/validators/IsUrl';
import { IsEmail, IsIn, Validate } from 'class-validator';

export class CreateResetDeviceDto {
  @IsEmail()
  email!: string;

  @IsUrl()
  resetUrl!: string;

  /** In the future, we might want to add more types of reset flows */
  @IsIn([RESET_SECURITY_FLOW_TYPE.TOTP])
  type!: RESET_SECURITY_FLOW_TYPE.TOTP;
}

export class UpdateResetDeviceDto {
  @Validate(IsPassword)
  password!: string;

  /** In the future, we might want to add more types of reset flows */
  @IsIn([RESET_SECURITY_FLOW_TYPE.TOTP])
  type!: RESET_SECURITY_FLOW_TYPE.TOTP;
}
