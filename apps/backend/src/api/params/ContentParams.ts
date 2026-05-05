import type { ContentId } from '@beabee/beabee-common';
import { contentIds } from '@beabee/beabee-common';

import { IsIn } from 'class-validator';

export class ContentParams {
  @IsIn(contentIds)
  id!: ContentId;
}
