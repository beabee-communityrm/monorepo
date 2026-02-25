import { IsUUID } from 'class-validator';

export class SignupConfirmEmailParams {
  @IsUUID('4')
  flowId!: string;
}
