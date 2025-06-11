import { BadRequestError } from 'routing-controllers';

export class ExternalEmailTemplate extends BadRequestError {
  readonly code = 'external-email-template';
  constructor() {
    super();
    Object.setPrototypeOf(this, ExternalEmailTemplate.prototype);
  }
}
