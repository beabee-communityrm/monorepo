import type { ContentSystemData } from '@beabee/beabee-common';

import IsOrigin from '#api/validators/IsOrigin';

export class GetContentSystemDto implements ContentSystemData {
  @IsOrigin({ each: true })
  trustedOrigins!: string[];
}
