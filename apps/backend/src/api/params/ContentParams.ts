import { ContentId, contentIds } from '@beabee/beabee-common';

import { Transform } from 'class-transformer';
import { IsIn } from 'class-validator';

export class ContentParams {
  // Express 5 captures multi-segment wildcards as `string[]`; reassemble
  // them to the original `'join/setup'`-style ContentId before validation.
  @Transform(({ value }) => (Array.isArray(value) ? value.join('/') : value))
  @IsIn(contentIds)
  id!: ContentId;
}
