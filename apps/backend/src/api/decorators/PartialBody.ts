import { Body, BodyOptions } from 'routing-controllers';

export default (options?: BodyOptions) =>
  Body({
    validate: { skipMissingProperties: true },
    ...options,
  });
