import IsPassword from '@api/validators/IsPassword';
import IsUrl from '@api/validators/IsUrl';
import { IsEmail, IsOptional, IsString, Validate } from 'class-validator';

export class CreateResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsUrl()
  resetUrl!: string;
}

export class UpdateResetPasswordDto {
  @Validate(IsPassword)
  password!: string;

  /** If MFA is enabled, we need to provide the token */
  @IsOptional()
  @IsString()
  token?: string;
}
