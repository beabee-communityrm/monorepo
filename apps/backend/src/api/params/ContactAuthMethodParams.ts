import { Matches } from 'class-validator';

export class ContactAuthMethodParams {
  /** Provider-issued identifier, see GetContactAuthMethodData */
  @Matches(/^[\w-]+$/)
  methodId!: string;
}
