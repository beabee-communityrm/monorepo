import type { BodyOptions } from 'routing-controllers';
import { Body } from 'routing-controllers';

export default (options?: BodyOptions) =>
  Body({
    validate: { skipMissingProperties: true },
    ...options,
  });
