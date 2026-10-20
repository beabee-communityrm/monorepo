import { IsString, Matches } from 'class-validator';

export class ContactAuthMethodParams {
  /** Contact ID or `me`, resolved by the TargetUser decorator */
  @IsString()
  id!: string;

  /** Provider-issued identifier, see GetContactAuthMethodData */
  @Matches(/^[\w-]+$/)
  methodId!: string;
}
